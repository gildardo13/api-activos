import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

import { PrismaService } from '../../prisma/prisma.service';

// ─────────────────────────────────────────────────────────────────────────────
// Modelo interno normalizado
// ─────────────────────────────────────────────────────────────────────────────
export interface InternalModel {
  id: string;
  name: string;
  idArea?: string | null;
}

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name);

  private readonly rhClient: AxiosInstance;
  private readonly authBaseUrl: string;

  private systemAccessToken: string | null = null;
  private systemRefreshToken: string | null = null;

  constructor(private readonly prisma: PrismaService) {
    const env = process.env.CONTROL_ACTIVOS_ENV;

    const isProd = env === 'prod';
    const isTest = env === 'test';

    // ────────────────────────────────────────────────────────────────────────
    // RH BACKEND URL
    // ────────────────────────────────────────────────────────────────────────
    const rhBaseUrl = isProd ? process.env.RH_BACK_PROD : process.env.RH_BACK_DEV;

    // ────────────────────────────────────────────────────────────────────────
    // AUTH BACKEND URL
    // ────────────────────────────────────────────────────────────────────────
    this.authBaseUrl =
      (isProd
        ? process.env.CONTROL_ACTIVOS_AUTH_BACK_PROD
        : isTest
          ? process.env.CONTROL_ACTIVOS_AUTH_BACK_TEST
          : process.env.CONTROL_ACTIVOS_AUTH_BACK_DEV) ||
      'http://localhost:4003/';

    // ────────────────────────────────────────────────────────────────────────
    // AXIOS CLIENT
    // ────────────────────────────────────────────────────────────────────────
    this.rhClient = axios.create({
      baseURL: rhBaseUrl,
      timeout: parseInt(process.env.EXTERNAL_API_TIMEOUT || '10000', 10),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        systemkey: process.env.TURNSTILE_SECRET_KEY || '',
      },
    });

    // ────────────────────────────────────────────────────────────────────────
    // Interceptor 401 → refresh token
    // ────────────────────────────────────────────────────────────────────────
    this.rhClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          this.logger.warn('401 recibido — intentando refrescar token del sistema...');

          try {
            const newToken = await this.refreshSystemToken();

            if (newToken) {
              this.logger.log('Token refrescado — reintentando request original...');
              originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
              return this.rhClient(originalRequest);
            }
          } catch (refreshError: any) {
            this.logger.error(`Error refrescando token: ${refreshError.message}`);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // FETCH ALL PAGES (helper genérico paginado)
  // ───────────────────────────────────────────────────────────────────────────

  private async fetchAllPages<T>(
    params: {
      url: string;
      token?: string;
      organizationId?: string;
      pageSize?: number;
    },
    typeMethod: 'GET' | 'POST' = 'GET',
  ): Promise<T[]> {
    const pageSize = params.pageSize ?? 100;

    let page = 1;
    const allItems: T[] = [];

    while (true) {
      const headers = this.buildHeaders(params.token, params.organizationId);

      const requestConfig: AxiosRequestConfig = {
        method: typeMethod,
        url: params.url,
        headers,
      };

      if (typeMethod === 'GET') {
        requestConfig.params = { page, pageSize };
      } else {
        requestConfig.data = { data: {}, page, pageSize };
      }

      const response = await this.requestWithRetry<any>(requestConfig);
      const data = response.data;

      const items: T[] =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.items)
              ? data.items
              : [];

      if (!items.length) break;

      allItems.push(...items);
      this.logger.debug(
        `Page ${page} → items: ${items.length} | total acumulado: ${allItems.length}`,
      );

      page++;

      if (items.length < pageSize) break;
    }

    return allItems;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // HEADERS
  // ───────────────────────────────────────────────────────────────────────────

  private buildHeaders(
    token?: string,
    organizationId?: string,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const activeToken =
      token ||
      this.systemAccessToken ||
      process.env.SYSTEM_ACCESS_TOKEN ||
      ''

    if (activeToken) {
      headers['Cookie'] = `app_session=${activeToken}`;
    }

    headers['empresa'] =
      organizationId ||
      process.env.DEFAULT_ORGANIZATION_ID ||
      '';

    return headers;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // REFRESH TOKEN
  // ───────────────────────────────────────────────────────────────────────────

  private async refreshSystemToken(): Promise<string | null> {
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;
    const refreshToken = this.systemRefreshToken || process.env.SYSTEM_REFRESH_TOKEN;
    const staticToken = process.env.SYSTEM_ACCESS_TOKEN;

    if (staticToken && !refreshToken && !clientId) {
      this.systemAccessToken = staticToken;
      return staticToken;
    }

    if (!clientId && !clientSecret && !refreshToken) {
      return null;
    }

    try {
      let res: any;

      if (refreshToken) {
        res = await axios.post(
          `${this.authBaseUrl}api/auth/oauth2/token`,
          {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: clientId || '',
            client_secret: clientSecret || '',
          },
          { timeout: 8000 },
        );
      } else {
        res = await axios.post(
          `${this.authBaseUrl}api/auth/oauth2/token`,
          {
            grant_type: 'client_credentials',
            client_id: clientId || '',
            client_secret: clientSecret || '',
          },
          { timeout: 8000 },
        );
      }

      const data = res.data;

      this.systemAccessToken =
        data?.access_token ||
        data?.accessToken ||
        data?.token ||
        null;

      return this.systemAccessToken;
    } catch (oauthError: any) {
      this.logger.warn(
        `OAuth2 falló obteniendo token: ${oauthError.response?.data?.error || oauthError.message}`,
      );
      return null;
    }
  }

  private async requestWithRetry<T>(
    config: AxiosRequestConfig,
    retries = 3,
    delayMs = 1000,
  ): Promise<AxiosResponse<T>> {
    try {
      return await this.rhClient.request<T>(config);
    } catch (error: any) {
      const isTransient =
        !error.response ||
        (error.response.status >= 500 && error.response.status <= 599);

      if (isTransient && retries > 0) {
        this.logger.warn(
          `Request ${config.url} falló — retry en ${delayMs}ms (${retries} restantes)`,
        );

        await new Promise((r) => setTimeout(r, delayMs));

        return this.requestWithRetry<T>(config, retries - 1, delayMs * 2);
      }

      const statusCode = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
      const errorMessage = error.response?.data?.message || error.message || 'Error HTTP';

      this.logger.error(`HTTP ${statusCode} — ${errorMessage} [${config.url}]`);

      throw new HttpException(
        {
          status: statusCode,
          error: errorMessage,
          message: `Error de integración: ${errorMessage}`,
        },
        statusCode,
      );
    }
  }
}