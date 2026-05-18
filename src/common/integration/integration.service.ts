import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

// ─────────────────────────────────────────────────────────────────────────────
// Modelo interno normalizado (id + name) que comparten Categories, Staff, Areas
// ─────────────────────────────────────────────────────────────────────────────
export interface InternalModel {
  id: string;
  name: string;
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

    // ── Resolver URL del backend RH según entorno ────────────────────────────
    const rhBaseUrl =
      process.env.EXTERNAL_RH_API_URL ||
      (isProd
        ? process.env.CONTROL_ACTIVOS_BACK_PROD
        : isTest
          ? process.env.CONTROL_ACTIVOS_BACK_TEST
          : process.env.CONTROL_ACTIVOS_BACK_DEV) ||
      'http://localhost:2001/';

    // ── Resolver URL del backend Auth ────────────────────────────────────────
    this.authBaseUrl =
      process.env.EXTERNAL_AUTH_API_URL ||
      (isProd
        ? process.env.CONTROL_ACTIVOS_AUTH_BACK_PROD
        : isTest
          ? process.env.CONTROL_ACTIVOS_AUTH_BACK_TEST
          : process.env.CONTROL_ACTIVOS_AUTH_BACK_DEV) ||
      'http://localhost:4003/';


    // ── Construir cliente Axios ───
    this.rhClient = axios.create({
      baseURL: rhBaseUrl,
      timeout: parseInt(process.env.EXTERNAL_API_TIMEOUT || '10000', 10),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        systemkey: process.env.TURNSTILE_SECRET_KEY || '',
      },
    });

    // ── Interceptor: 401 → refresh token automático ──────────────────────────
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


  async syncCategories(params: {
    token?: string;
    organizationId?: string;
  } = {}): Promise<void> {
    this.logger.log('Sincronizando categorías externas...');

    const items = await this.fetchAllPages<any>({
      url: 'category',
      token: params.token,
      organizationId: params.organizationId,
    });

    const transformed = items.map((i) => this.transformCategory(i));

    await Promise.all(
      transformed.map((cat) =>
        this.prisma.client.jibbyCategory.upsert({
          where: { id: cat.id },
          create: { id: cat.id, name: cat.name },
          update: { name: cat.name },
        }),
      ),
    );

    this.logger.log(`Categorías sincronizadas: ${transformed.length}`);
  }

  /**
   * Sincroniza personal RH externo → tabla local `RhStaff`.
   */
  async syncStaff(params: {
    token?: string;
    organizationId?: string;
  } = {}): Promise<void> {
    this.logger.log('Sincronizando staff externo...');

    const items = await this.fetchAllPages<any>({
      url: 'staff',
      token: params.token,
      organizationId: params.organizationId,
    });

    const transformed = items.map((i) => this.transformStaff(i));

    await Promise.all(
      transformed.map((staff) =>
        this.prisma.client.rhStaff.upsert({
          where: { id: staff.id },
          create: { id: staff.id, name: staff.name },
          update: { name: staff.name },
        }),
      ),
    );

    this.logger.log(`Staff sincronizado: ${transformed.length}`);
  }

  /**
   * Sincroniza áreas externas → tabla local `RhArea`.
   */
  async syncAreas(params: {
    token?: string;
    organizationId?: string;
  } = {}): Promise<void> {
    this.logger.log('Sincronizando áreas externas...');

    const items = await this.fetchAllPages<any>({
      url: 'area',
      token: params.token,
      organizationId: params.organizationId,
    });

    const transformed = items.map((i) => this.transformArea(i));

    await Promise.all(
      transformed.map((area) =>
        this.prisma.client.rhArea.upsert({
          where: { id: area.id },
          create: { id: area.id, name: area.name },
          update: { name: area.name },
        }),
      ),
    );

    this.logger.log(`Áreas sincronizadas: ${transformed.length}`);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // GET — Lee de la tabla LOCAL (con sync-on-empty automático)
  // ───────────────────────────────────────────────────────────────────────────

  async getCategories(
    prisma?: any,
    params: { token?: string; organizationId?: string; forceSync?: boolean } = {},
  ): Promise<InternalModel[]> {
    const db = prisma ?? this.prisma.client;

    const count = await db.jibbyCategory.count();

    if (count === 0 || params.forceSync) {
      this.logger.log('JibbyCategory vacía — ejecutando syncCategories()...');
      await this.syncCategories({ token: params.token, organizationId: params.organizationId });
    }

    const rows = await db.jibbyCategory.findMany({ orderBy: { name: 'asc' } });
    return rows.map((r: any) => ({ id: r.id, name: r.name }));
  }

  /**
   * Retorna staff desde la tabla local `RhStaff`.
   * Si la tabla está vacía, ejecuta `syncStaff()` primero.
   */
  async getStaff(
    prisma?: any,
    params: { token?: string; organizationId?: string; forceSync?: boolean } = {},
  ): Promise<InternalModel[]> {
    const db = prisma ?? this.prisma.client;

    const count = await db.rhStaff.count();

    if (count === 0 || params.forceSync) {
      this.logger.log('RhStaff vacío — ejecutando syncStaff()...');
      await this.syncStaff({ token: params.token, organizationId: params.organizationId });
    }

    const rows = await db.rhStaff.findMany({ orderBy: { name: 'asc' } });
    return rows.map((r: any) => ({ id: r.id, name: r.name }));
  }

  /**
   * Retorna áreas desde la tabla local `RhArea`.
   * Si la tabla está vacía, ejecuta `syncAreas()` primero.
   */
  async getAreas(
    prisma?: any,
    params: { token?: string; organizationId?: string; forceSync?: boolean } = {},
  ): Promise<InternalModel[]> {
    const db = prisma ?? this.prisma.client;

    const count = await db.rhArea.count();

    if (count === 0 || params.forceSync) {
      this.logger.log('RhArea vacía — ejecutando syncAreas()...');
      await this.syncAreas({ token: params.token, organizationId: params.organizationId });
    }

    const rows = await db.rhArea.findMany({ orderBy: { name: 'asc' } });
    return rows.map((r: any) => ({ id: r.id, name: r.name }));
  }

  private async fetchAllPages<T>(params: {
    url: string;
    token?: string;
    organizationId?: string;
    pageSize?: number;
  }): Promise<T[]> {
    const pageSize = params.pageSize ?? 100;
    let page = 1;
    let allItems: T[] = [];

    while (true) {
      const headers = this.buildHeaders(params.token, params.organizationId);

      const response = await this.requestWithRetry<any>({
        method: 'GET',
        url: params.url,
        params: { page, pageSize },
        headers,
      });

      const data = response.data;

      // Normalizar respuesta: puede ser array plano o paginado
      const items: T[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.items)
            ? data.items
            : [];

      if (items.length === 0) break;

      allItems = allItems.concat(items);

      // Si la respuesta indica total, verificar si hay más páginas
      const total: number = data?.total ?? data?.totalCount ?? Infinity;
      if (allItems.length >= total || items.length < pageSize) break;

      page++;
    }

    return allItems;
  }

  /**
   * Construye los headers para una request al RH API.
   * Usa el token de usuario si existe; si no, el token del sistema.
   */
  private buildHeaders(
    token?: string,
    organizationId?: string,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const activeToken = token
      ? (token.startsWith('Bearer ') ? token.slice(7) : token)
      : this.systemAccessToken || process.env.SYSTEM_ACCESS_TOKEN || '';

    if (activeToken) {
      headers['Authorization'] = `Bearer ${activeToken}`;
    }

    headers['empresa'] =
      organizationId || process.env.DEFAULT_ORGANIZATION_ID || '';

    return headers;
  }

  

  private async refreshSystemToken(): Promise<string | null> {
    try {
      const refreshToken = this.systemRefreshToken || process.env.SYSTEM_REFRESH_TOKEN;
      let res: any;
      if (refreshToken) {
        res = await axios.post(`${this.authBaseUrl}api/auth/oauth2/token`,
          {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: process.env.CLIENT_ID || '',
            client_secret: process.env.CLIENT_SECRET || '',
          },
          { timeout: 8000 },
        );
      } else {
        res = await axios.post(`${this.authBaseUrl}api/auth/oauth2/token`,
          {
            grant_type: 'client_credentials',
            client_id: process.env.CLIENT_ID || '',
            client_secret: process.env.CLIENT_SECRET || '',
          },
          { timeout: 8000 },
        );
      }

      const data = res.data;
      this.systemAccessToken = data?.access_token || data?.accessToken || data?.token || null;

      return this.systemAccessToken;
    } catch (oauthError: any) {
      this.logger.error(
        `OAuth2 falló: ${oauthError.response?.data?.error || oauthError.message}`,
      );

    }
  }


  /**
   * Ejecuta un request HTTP con reintentos automáticos y backoff exponencial.
   * Solo reintenta en errores de red o respuestas 5xx (errores transitorios).
   */
  private async requestWithRetry<T>(
    config: AxiosRequestConfig,
    retries = 3,
    delayMs = 1000,
  ): Promise<AxiosResponse<T>> {
    // Inyectar token si no viene en el config
    if (!config.headers?.['Authorization']) {
      const token = this.systemAccessToken || process.env.SYSTEM_ACCESS_TOKEN;
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }

    try {
      return await this.rhClient.request<T>(config);
    } catch (error: any) {
      const isTransient =
        !error.response ||
        (error.response.status >= 500 && error.response.status <= 599);

      if (isTransient && retries > 0) {
        this.logger.warn(
          `Request ${config.url} falló — reintentando en ${delayMs}ms (${retries} intentos restantes)`,
        );
        await new Promise((r) => setTimeout(r, delayMs));
        return this.requestWithRetry<T>(config, retries - 1, delayMs * 2);
      }

      const statusCode =
        error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
      const errorMessage =
        error.response?.data?.message || error.message || 'Error HTTP';

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

  private transformCategory(item: any): InternalModel {
    const id = item.id || item.categoryId || item.id_cat || item._id || '';
    const name = item.name || item.categoryName || item.desc_cat || item.nombre || 'Sin nombre';
    return { id: String(id), name: String(name) };
  }

  private transformStaff(item: any): InternalModel {
    const id = item.id || item.staffId || item.id_personal || item._id || '';
    let name = item.name || item.fullName || item.nombre || item.nombreCompleto || '';
    return { id: String(id), name: name.trim() || 'Colaborador sin nombre' };
  }

  private transformArea(item: any): InternalModel {
    const id = item.id || item.areaId || item.id_area || item._id || '';
    const name = item.name || item.areaName || item.nombre_area || item.nombre || 'Área sin nombre';
    return { id: String(id), name: String(name) };
  }
}