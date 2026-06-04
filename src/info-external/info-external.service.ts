import { Injectable, HttpException, HttpStatus, Logger, Scope, Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import axios, { AxiosInstance } from 'axios';

// ─────────────────────────────────────────────────────────────────────────────
// Modelos normalizados de respuesta
// ─────────────────────────────────────────────────────────────────────────────
export interface RhStaffItem {
  id: string;
  name: string;
  idArea?: string | null;
}

export interface RhAreaItem {
  id: string;
  name: string;
}

export interface RhCategoryItem {
  id: string;
  name: string;
}

@Injectable({ scope: Scope.REQUEST })
export class InfoExternalService {
  private readonly logger = new Logger(InfoExternalService.name);

  constructor(@Inject(REQUEST) private readonly request: Request) { }

  // ───────────────────────────────────────────────────────────────────────────
  // Helpers internos: lee token y empresa del request (puesto por el middleware)
  // ───────────────────────────────────────────────────────────────────────────
  private get _token(): string {
    return (this.request as any).accessToken
      || process.env.SYSTEM_ACCESS_TOKEN
      || '';
  }

  private get _empresa(): string {
    return (this.request as any).empresa
      || process.env.DEFAULT_ORGANIZATION_ID
      || '';
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Axios client apuntando al backend de RH
  // ───────────────────────────────────────────────────────────────────────────
  private rhApi(): AxiosInstance {
    return axios.create({
      baseURL:
        process.env.CONTROL_ACTIVOS_ENV === 'dev'
          ? process.env.RH_BACK_DEV
          : process.env.CONTROL_ACTIVOS_ENV === 'prod'
            ? process.env.RH_BACK_PROD
            : process.env.RH_BACK_TEST,
      timeout: parseInt(process.env.EXTERNAL_API_TIMEOUT || '10000', 10),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  private rootApi(): AxiosInstance {
    return axios.create({
      baseURL:
        process.env.CONTROL_ACTIVOS_ENV === 'dev'
          ? process.env.ROOT_BACK_DEV
          : process.env.CONTROL_ACTIVOS_ENV === 'prod'
            ? process.env.ROOT_BACK_PROD
            : process.env.ROOT_BACK_TEST,
      timeout: parseInt(process.env.EXTERNAL_API_TIMEOUT || '10000', 10),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  private idCatalog(): string {
    return process.env.ID_CATALOG_BACK_DEV;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // Helpers de headers (cookie de sesión + empresa)
  // Usa los valores del request inyectado; no requiere parámetros.
  // ───────────────────────────────────────────────────────────────────────────
  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this._token) headers['Cookie'] = `app_session=${this._token}`;
    headers['empresa'] = this._empresa;
    return headers;
  }

  async getCatalogJibby(): Promise<RhCategoryItem[]> {
    try {
      const res = await this.rootApi().get<any>(
        `catalog/${this.idCatalog()}/selector`,
        { headers: this.buildHeaders() }
      );
      const raw = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      // Mapeo directo y limpio basado en la respuesta real de la API de Jibby
      return raw.map((i) => ({
        id: String(i.value ?? ''),
        name: String(i.label ?? 'Sin nombre'),
      }));

    } catch (err: any) {
      this.logger.error(`getCatalogJibby error: ${err.message}`);
      throw new HttpException(
        'Error al obtener catálogos desde el servicio externo',
        HttpStatus.BAD_GATEWAY
      );
    }
  }

  async getStaffRh(): Promise<RhStaffItem[]> {
    try {
      const allItems: any[] = [];
      let page = 1;
      const pageSize = 100;

      while (true) {
        const res = await this.rhApi().post<any>(
          'staff/find_all',
          { data: {}, page, pageSize },
          { headers: this.buildHeaders() },
        );

        const items: any[] = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : [];

        if (!items.length) break;
        allItems.push(...items);
        if (items.length < pageSize) break;
        page++;
      }

      return allItems.map((i) => ({
        id: String(i.id ?? i.staffId ?? i.id_personal ?? i._id ?? ''),
        name: String(i.fullName ?? i.name ?? i.nombre ?? i.nombreCompleto ?? 'Sin nombre').trim(),
        idArea: i?.position?.area?.id ? String(i.position.area.id) : null,
      }));
    } catch (err: any) {
      this.logger.error(`getStaffRh error: ${err.message}`);
      throw new HttpException('Error al obtener staff', HttpStatus.BAD_GATEWAY);
    }
  }

  async getAreasRh(): Promise<RhAreaItem[]> {
    try {
      const res = await this.rhApi().get<any>('area/selector', {
        headers: this.buildHeaders(),
      });

      const raw: any[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      return raw
        .map((i) => ({
          id: String(i.value ?? i.id ?? i.areaId ?? i._id ?? ''),
          name: String(i.label ?? i.name ?? i.nombre ?? 'Área sin nombre'),
        }))
        .filter((a) => a.id);
    } catch (err: any) {
      this.logger.error(`getAreasRh error: ${err.message}`);
      throw new HttpException('Error al obtener áreas', HttpStatus.BAD_GATEWAY);
    }
  }

  async getStaffByIdArea(idArea: string): Promise<RhStaffItem[]> {
    try {
      const all = await this.getStaffRh();
      return all.filter((s) => s.idArea === idArea);
    } catch (err: any) {
      this.logger.error(`getStaffByIdArea error: ${err.message}`);
      throw new HttpException('Error al obtener staff por área', HttpStatus.BAD_GATEWAY);
    }
  }

  async getSubAreasRh(): Promise<RhAreaItem[]> {
    try {
      const res = await this.rhApi().get<any>('area/get_nesting_areas', {
        headers: this.buildHeaders(),
      });

      const raw: any[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      return raw
        .map((i) => ({
          id: String(i.value ?? i.id ?? i.areaId ?? i._id ?? ''),
          name: String(i.label ?? i.name ?? i.nombre ?? 'Área sin nombre'),
          subareas: i.subareas?.map((s) => ({
            id: String(s.value ?? s.id ?? s.areaId ?? s._id ?? ''),
            name: String(s.label ?? s.name ?? s.nombre ?? 'Área sin nombre'),
            key: String(s.key ?? s.key_area ?? s.areaId ?? s._id ?? ''),
            subareas: s.subareas?.map((ss) => ({
              id: String(ss.value ?? ss.id ?? ss.areaId ?? ss._id ?? ''),
              name: String(ss.label ?? ss.name ?? ss.nombre ?? 'Área sin nombre'),
              parentId: String(ss.parentId ?? ss.key ?? ss.areaId ?? ss._id ?? ''),
            })) ?? [],
          })) ?? [],
        }))
        .filter((a) => a.id);
    } catch (err: any) {
      this.logger.error(`getAreasRh error: ${err.message}`);
      throw new HttpException('Error al obtener áreas', HttpStatus.BAD_GATEWAY);
    }
  }

  async getSubAreasRhById(idArea: string): Promise<RhAreaItem[]> {
    try {
      const res = await this.rhApi().get<any>(`area/selector_subareas/${idArea}`, {
        headers: this.buildHeaders(),
      });
      const raw: any[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      return raw
        .map((i) => ({
          id: String(i.value ?? i.id ?? i.areaId ?? i._id ?? ''),
          name: String(i.label ?? i.name ?? i.nombre ?? 'Área sin nombre'),
          subareas: i.subareas?.map((ss) => ({
            id: String(ss.value ?? ss.id ?? ss.areaId ?? ss._id ?? ''),
            name: String(ss.label ?? ss.name ?? ss.nombre ?? 'Área sin nombre'),
            parentId: String(ss.parentId ?? ss.key ?? ss.areaId ?? ss._id ?? ''),
          })) ?? [],
        }))
        .filter((a) => a.id);
    } catch (err: any) {
      this.logger.error(`getAreasRh error: ${err.message}`);
      throw new HttpException('Error al obtener áreas', HttpStatus.BAD_GATEWAY);
    }
  }

  async getSubIdMiniSubAreasRh(idArea: string, idSubArea: string): Promise<any[]> {
    try {
      const res = await this.rhApi().get<any>('area/get_nesting_areas', {
        headers: this.buildHeaders(),
      });

      const raw: any[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
      const normalizedAreas = raw
        .map((i) => ({
          id: String(i.value ?? i.id ?? i.areaId ?? i._id ?? ''),
          name: String(i.label ?? i.name ?? i.nombre ?? 'Área sin nombre'),
          subareas: i.subareas?.map((s) => ({
            id: String(s.value ?? s.id ?? s.areaId ?? s._id ?? ''),
            name: String(s.label ?? s.name ?? s.nombre ?? 'Área sin nombre'),
            key: String(s.key ?? s.key_area ?? s.areaId ?? s._id ?? ''),
            subareas: s.subareas?.map((ss) => ({
              id: String(ss.value ?? ss.id ?? ss.areaId ?? ss._id ?? ''),
              name: String(ss.label ?? ss.name ?? ss.nombre ?? 'Área sin nombre'),
              parentId: String(ss.parentId ?? ss.key ?? ss.areaId ?? ss._id ?? ''),
            })) ?? [],
          })) ?? [],
        }))
        .filter((a) => a.id);

      const areaEncontrada = normalizedAreas.find((a) => a.id === idArea);
      if (!areaEncontrada) return [];

      const subAreaEncontrada = areaEncontrada.subareas.find((s) => s.id === idSubArea);
      if (!subAreaEncontrada) return [];

      return subAreaEncontrada.subareas;

    } catch (err: any) {
      this.logger.error(`getAreasRh error: ${err.message}`);
      throw new HttpException('Error al obtener áreas', HttpStatus.BAD_GATEWAY);
    }
  }

  async getPositionsBySubMiniArea(idArea: string): Promise<any[]> {
    try {
      const res = await this.rhApi().get<any>(`position/selector_list`, {
        headers: this.buildHeaders(),
      });

      // 1. Validamos que la respuesta contenga un array
      const raw: any[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      // 2. Filtramos PRIMERO para quedarnos solo con los que coincidan con el areaId
      // Nota: Usamos item.areaId porque así viene directo en tu JSON de respuesta
      return raw
        .filter((item) => String(item.areaId) === String(idArea))
        .map((item) => ({
          id: String(item.value ?? item.id ?? ''),
          name: String(item.label ?? item.name ?? 'Puesto sin nombre'),
          areaId: String(item.areaId ?? ''),
          areaName: String(item.area ?? ''),
        }))
        .filter((puesto) => puesto.id); // Asegura que no vayan registros rotos sin ID

    } catch (err: any) {
      this.logger.error(`getPositionsBySubMiniArea error: ${err.message}`);
      throw new HttpException('Error al obtener los puestos', HttpStatus.BAD_GATEWAY);
    }
  }
  async getCredentailsByStaffId(userId: string) {
    try {
      const res = await this.rhApi().get<any>(`staff/user/data/${userId}/${this._empresa}`, {
        headers: this.buildHeaders(),
      });
      if (res.data && res.data.id) {
        return res.data;
      }

      const raw = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

      return raw;
    } catch (err: any) {
      this.logger.error(`getCredentailsByStaffId error: ${err.message}`);
      const status = err.response?.status || HttpStatus.BAD_GATEWAY;
      throw new HttpException(
        err.response?.data?.message || 'Error al obtener credenciales',
        status
      );
    }
  }

}
