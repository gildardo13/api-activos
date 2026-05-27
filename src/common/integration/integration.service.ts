import {
  Injectable,
  HttpException,
  HttpStatus,
  Logger,
  OnApplicationBootstrap,
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
export class IntegrationService implements OnApplicationBootstrap {
  private readonly logger = new Logger(IntegrationService.name);

  private readonly rhClient: AxiosInstance;
  private readonly authBaseUrl: string;

  private systemAccessToken: string | null = null;
  private systemRefreshToken: string | null = null;

  /** Evita sincronizar múltiples veces */
  private hasSynced = false;



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

        if (
          error.response?.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;

          this.logger.warn(
            '401 recibido — intentando refrescar token del sistema...',
          );

          try {
            const newToken = await this.refreshSystemToken();

            if (newToken) {
              this.logger.log(
                'Token refrescado — reintentando request original...',
              );

              originalRequest.headers['Authorization'] =
                `Bearer ${newToken}`;

              return this.rhClient(originalRequest);
            }
          } catch (refreshError: any) {
            this.logger.error(
              `Error refrescando token: ${refreshError.message}`,
            );
          }
        }

        return Promise.reject(error);
      },
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // APP BOOTSTRAP
  // ───────────────────────────────────────────────────────────────────────────

  async onApplicationBootstrap(): Promise<void> {
    const token = await this.refreshSystemToken();

    if (token) {
      this.logger.log(
        'Credenciales detectadas — sincronizando RH...',
      );

      await this._runSync();
    } else {
      this.logger.log(
        'ℹSin credenciales de sistema.',
      );
    }
  }

  /**
   * Trigger manual bootstrap sync
   */
  async triggerBootstrapSync(sessionToken: string, organizationId: string): Promise<void> {
    if (sessionToken === 'dev-mock-token-xyz-123' || (sessionToken && sessionToken.startsWith('dev-mock-token'))) {
      this.logger.log('Bypassing triggerBootstrapSync because token is mock.');
      return;
    }
    // Ponemos TODO el proceso en un bloque try/catch para que NUNCA tire el servidor si la API externa falla
    try {
      const countRes = await this.requestWithRetry<{ staffActive: number }>({
        method: 'GET',
        url: '/staff/count/staff',
        headers: this.buildHeaders(
          this.systemAccessToken,
          organizationId,
        ),
      });

      const expected = countRes.data?.staffActive || 0;
      const dbCount = await this.prisma.rhStaff.count();

      const isSynced = dbCount >= expected;
      this.hasSynced = isSynced;

      if (this.hasSynced) {
        this.logger.log('El conteo local coincide con el de la API externa. Sincronización omitida.');
        return;
      }

      this.systemAccessToken = sessionToken;

      // Ejecutamos la sincronización real controlando el error internamente
      await this._runSync();

    } catch (err: any) {
      // Capturamos el Axios / HttpException aquí. 
      // El servidor se mantendrá vivo y registrará el error de manera limpia.
      this.logger.error(
        `No se pudo completar el bootstrap de integración (API Externa inaccesible o Timeout): ${err.message}`,
      );

      // Reiniciamos el flag para permitir que un intento posterior vuelva a probar
      this.hasSynced = false;
    }
  }

  private async _runSync(): Promise<void> {
    if (this.hasSynced) return;

    this.hasSynced = true;

    this.logger.log(
      'Sincronizando RH (staff + áreas)...',
    );

    try {
      await Promise.allSettled([
        this.syncStaff(),
        this.syncAreas(),
      ]);

      this.logger.log(
        'Sincronización RH completada.',
      );
    } catch (err: any) {
      this.hasSynced = false;

      this.logger.error(
        `Error sincronizando RH: ${err.message}`,
      );
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // CATEGORIES
  // ───────────────────────────────────────────────────────────────────────────

  async syncCategories(params: {
    token?: string;
    organizationId?: string;
  } = {}): Promise<void> {
    this.logger.log(
      'Sincronizando categorías externas...',
    );

    const items = await this.fetchAllPages<any>({
      url: 'category',
      token: this.systemAccessToken,
      organizationId: params.organizationId,
    }, 'GET');

    const transformed = items.map((i) =>
      this.transformCategory(i),
    );

    await Promise.all(
      transformed.map((cat) =>
        this.prisma.jibbyCategory.upsert({
          where: { id: cat.id },
          create: {
            id: cat.id,
            name: cat.name,
          },
          update: {
            name: cat.name,
          },
        }),
      ),
    );

    this.logger.log(
      `Categorías sincronizadas: ${transformed.length}`,
    );
  }

  async syncStaff(params: {
    token?: string;
    organizationId?: string;
  } = {}): Promise<void> {

    this.logger.log('Sincronizando staff externo...');

    const items = await this.fetchAllPages<any>(
      {
        url: 'staff/find_all',
        token: params.token || this.systemAccessToken || undefined,
      },
      'POST',
    );

    const transformed = items.map((i) => {
      const id =
        i.id ??
        i.staffId ??
        i.id_personal ??
        i._id ??
        null;

      const name =
        i.fullName ??
        i.name ??
        i.nombre ??
        i.nombreCompleto ??
        'Sin nombre';
      const idArea =
        i?.position?.area?.id ?? null;

      return {
        id: id ? String(id).trim() : null,
        name: String(name).trim(),
        idArea: idArea ? String(idArea).trim() : null,
      };
    });

    const valid = transformed.filter(
      (s) => typeof s.id === 'string' && s.id.length > 0,
    );

    const unique = new Map<string, InternalModel>();
    for (const s of valid) {
      unique.set(s.id, s);
    }

    const finalStaff = [...unique.values()];

    let inserted = 0;
    let updated = 0;

    for (const staff of finalStaff) {
      const exists = await this.prisma.rhStaff.findUnique({
        where: { id: staff.id },
      });

      if (!exists) {
        inserted++
        await this.prisma.rhStaff.upsert({
          where: { id: staff.id },
          create: {
            id: staff.id,
            name: staff.name,
            idArea: staff.idArea ?? null,
          },
          update: {
            name: staff.name,
            idArea: staff.idArea ?? null,
          },
        });
      }


    }

    const dbCount = await this.prisma.rhStaff.count();

    this.logger.log(
      `Staff API: ${items.length} | procesados: ${finalStaff.length} | DB final: ${dbCount} (insertados: ${inserted})`,
    );
  }

  async syncAreas(params: {
    token?: string;
    organizationId?: string;
  } = {}): Promise<void> {
    this.logger.log(
      'Sincronizando áreas externas...',
    );

    const items = await this.fetchAllPages<any>({
      url: 'area/selector',
      token: this.systemAccessToken,
      organizationId: params.organizationId,
    }, 'GET');

    const transformed = items
      .map((i) => this.transformArea(i))
      .filter((a) => a.id);

    await Promise.all(
      transformed.map((area) =>
        this.prisma.rhArea.upsert({
          where: { id: area.id },
          create: {
            id: area.id,
            name: area.name,
          },
          update: {
            name: area.name,
          },
        }),
      ),
    );

    this.logger.log(
      `Áreas sincronizadas: ${transformed.length}`,
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // GETTERS
  // ───────────────────────────────────────────────────────────────────────────

  async getCategories(
    prisma?: any,
    params: {
      token?: string;
      organizationId?: string;
      forceSync?: boolean;
    } = {},
  ): Promise<InternalModel[]> {
    const db = prisma ?? this.prisma;

    const count = await db.jibbyCategory.count();

    if (count === 0 || params.forceSync) {
      await this.syncCategories({
        token: params.token,
        organizationId: params.organizationId,
      });
    }

    const rows = await db.jibbyCategory.findMany({
      orderBy: { name: 'asc' },
    });

    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      idArea: r.position.area.id || null,
    }));
  }

  async getStaff(
    prisma?: any,
    params: {
      token?: string;
      organizationId?: string;
      forceSync?: boolean;
    } = {},
  ): Promise<InternalModel[]> {
    const db = prisma ?? this.prisma;

    const count = await db.rhStaff.count();

    if (count === 0 || params.forceSync) {
      await this.syncStaff({
        token: params.token,
        organizationId: params.organizationId,
      });
    }

    const rows = await db.rhStaff.findMany({
      orderBy: { name: 'asc' },
    });

    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
    }));
  }

  async getAreas(
    prisma?: any,
    params: {
      token?: string;
      organizationId?: string;
      forceSync?: boolean;
    } = {},
  ): Promise<InternalModel[]> {
    const db = prisma ?? this.prisma;

    const count = await db.rhArea.count();

    if (count === 0 || params.forceSync) {
      await this.syncAreas({
        token: params.token,
        organizationId: params.organizationId,
      });
    }

    const rows = await db.rhArea.findMany({
      orderBy: { name: 'asc' },
    });

    return rows.map((r: any) => ({
      id: r.id,
      name: r.name,
    }));
  }

  // ───────────────────────────────────────────────────────────────────────────
  // FETCH ALL PAGES
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
      const headers = this.buildHeaders(
        params.token,
        params.organizationId,
      );

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

    // token de sesión RH
    const activeToken =
      token ||
      this.systemAccessToken ||
      process.env.SYSTEM_ACCESS_TOKEN ||
      '';

    // RH usa cookie app_session
    if (activeToken) {
      headers['Cookie'] = `app_session=${activeToken}`;
    }

    // empresa requerida por RH
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

    const clientSecret =
      process.env.CLIENT_SECRET;

    const refreshToken =
      this.systemRefreshToken ||
      process.env.SYSTEM_REFRESH_TOKEN;

    const staticToken =
      process.env.SYSTEM_ACCESS_TOKEN;

    if (staticToken && !refreshToken && !clientId) {
      this.systemAccessToken = staticToken;
      return staticToken;
    }

    if (
      !clientId &&
      !clientSecret &&
      !refreshToken
    ) {
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
          {
            timeout: 8000,
          },
        );
      } else {
        res = await axios.post(
          `${this.authBaseUrl}api/auth/oauth2/token`,
          {
            grant_type: 'client_credentials',
            client_id: clientId || '',
            client_secret: clientSecret || '',
          },
          {
            timeout: 8000,
          },
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
        `OAuth2 falló obteniendo token: ${oauthError.response?.data?.error ||
        oauthError.message
        }`,
      );

      return null;
    }
  }

  private async requestWithRetry<T>(
    config: AxiosRequestConfig,
    retries = 3,
    delayMs = 1000,
  ): Promise<AxiosResponse<T>> {
    /*if (!config.headers?.['Authorization']) {
      const token =
        this.systemAccessToken ||
        process.env.SYSTEM_ACCESS_TOKEN;

      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }*/

    try {
      return await this.rhClient.request<T>(config);
    } catch (error: any) {
      const isTransient =
        !error.response ||
        (error.response.status >= 500 &&
          error.response.status <= 599);

      if (isTransient && retries > 0) {
        this.logger.warn(
          `Request ${config.url} falló — retry en ${delayMs}ms (${retries} restantes)`,
        );

        await new Promise((r) =>
          setTimeout(r, delayMs),
        );

        return this.requestWithRetry<T>(
          config,
          retries - 1,
          delayMs * 2,
        );
      }

      const statusCode =
        error.response?.status ??
        HttpStatus.INTERNAL_SERVER_ERROR;

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Error HTTP';

      this.logger.error(
        `HTTP ${statusCode} — ${errorMessage} [${config.url}]`,
      );

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

  // ───────────────────────────────────────────────────────────────────────────
  // TRANSFORMERS
  // ───────────────────────────────────────────────────────────────────────────

  private transformCategory(
    item: any,
  ): InternalModel {
    const id =
      item.id ||
      item.categoryId ||
      item.id_cat ||
      item._id ||
      '';

    const name =
      item.name ||
      item.categoryName ||
      item.desc_cat ||
      item.nombre ||
      'Sin nombre';

    const idArea = item.position?.area?.id || null;

    return {
      id: String(id),
      name: String(name),
      idArea,
    };
  }

  private transformStaff(
    item: any,
  ): InternalModel {
    const id =
      item.id ||
      item.staffId ||
      item.id_personal ||
      item._id ||
      '';

    const name =
      item.name ||
      item.fullName ||
      item.nombre ||
      item.nombreCompleto ||
      '';

    return {
      id: String(id),
      name:
        name.trim() ||
        'Colaborador sin nombre',
    };
  }

  private transformArea(
    item: any,
  ): InternalModel {
    const id =
      item.value ||
      item.id ||
      item.areaId ||
      item.id_area ||
      item._id ||
      '';

    const name =
      item.label ||
      item.name ||
      item.areaName ||
      item.nombre_area ||
      item.nombre ||
      'Área sin nombre';

    return {
      id: String(id),
      name: String(name),
    };
  }
}