import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateHikConnectDto, DtoBodyCamHik } from './dto/create-hik-connect.dto';
import { UpdateHikConnectDto } from './dto/update-hik-connect.dto';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class HikConnectService {
  private readonly logger = new Logger(HikConnectService.name);
  private cachedToken: any = null;

  private get _secretKey(): string {
    return process.env.SECRET_KEY_HIKCONNECT || '';
  }

  private get _apiKey(): string {
    return process.env.APP_KEY_HIKCONNECT || '';
  }

  private hikConnectApi(): AxiosInstance {
    return axios.create({
      baseURL:
        process.env.CONTROL_ACTIVOS_ENV === 'dev'
          ? process.env.CONTROL_API_HIKCONNECT
          : process.env.CONTROL_ACTIVOS_ENV === 'prod'
            ? process.env.CONTROL_API_HIKCONNECT
            : process.env.CONTROL_API_HIKCONNECT,
      timeout: parseInt(process.env.EXTERNAL_API_TIMEOUT || '10000', 10),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  async getToken(forceRefresh = false) {
    if (!forceRefresh && this.cachedToken?.data?.accessToken) {
      this.logger.log("TOKEN EXISTENTE");
      return this.cachedToken;
    }

    try {
      this.logger.log("Obteniendo nuevo token de Hik-Connect...");
      const body = {
        appKey: this._apiKey,
        secretKey: this._secretKey
      };
      const res = await this.hikConnectApi().post<any>(
        '/api/hccgw/platform/v1/token/get',
        body
      );
      const data = res.data ? res.data : res;

      // Guardamos el token en caché
      this.cachedToken = data;
      return data;
    } catch (err: any) {
      this.logger.error(`getToken error: ${err.message}`);
      throw new HttpException('Error al obtener token', HttpStatus.BAD_GATEWAY);
    }
  }

  async getListCamHik() {
    let token: any;
    try {
      token = await this.getToken(false);
    } catch (err: any) {
      this.logger.error(`Error al obtener token inicial en getListCamHik: ${err.message}`);
      throw new HttpException('Error al obtener token', HttpStatus.BAD_GATEWAY);
    }

    const body = {
      pageIndex: 1,
      pageSize: 200,
      filter: {
        areaID: "-1",
        includeSubArea: "1",
        deviceID: "",
        deviceSerialNo: ""
      }
    };

    const makeRequest = async (accessToken: string) => {
      const res = await this.hikConnectApi().post<any>(
        '/api/hccgw/resource/v1/areas/cameras/get',
        body,
        {
          headers: {
            'Token': accessToken
          }
        }
      );
      return res.data ? res.data : res;
    };

    try {
      this.logger.log("Intentando obtener lista de cámaras Hik-Connect...");
      let data = await makeRequest(token?.data?.accessToken);

      // Si la respuesta indica un error de código, reintentamos con un nuevo token.
      if (data && data.code !== undefined && data.code !== '0' && data.code !== 0) {
        this.logger.warn(`Respuesta de lista de cámaras indica código de error: ${data.code}. Refrescando token y reintentando...`);
        token = await this.getToken(true);
        data = await makeRequest(token?.data?.accessToken);
      }
      return data;
    } catch (err: any) {
      this.logger.warn(`Error en primera consulta de lista de cámaras: ${err.message}. Intentando refrescar token y reintentar...`);
      try {
        token = await this.getToken(true);
        const data = await makeRequest(token?.data?.accessToken);
        return data;
      } catch (retryErr: any) {
        this.logger.error(`Error definitivo al obtener lista de cámaras: ${retryErr.message}`);
        throw new HttpException('Error al obtener lista de cámaras de Hik-Connect', HttpStatus.BAD_GATEWAY);
      }
    }
  }

  async getOneCamHik(dtoHik: DtoBodyCamHik & { suffix?: string }) {
    let token: any;
    try {
      token = await this.getToken(false);
    } catch (err: any) {
      this.logger.error(`Error al obtener token inicial en getOneCamHik: ${err.message}`);
      throw new HttpException('Error al obtener token', HttpStatus.BAD_GATEWAY);
    }

    const body = {
      deviceSerial: dtoHik.deviceSerial,
      resourceId: dtoHik.resourceId,
      type: "1",
      protocol: 3,
      quality: 2,
      expireTime: 60
    };

    const makeRequest = async (accessToken: string) => {
      const res = await this.hikConnectApi().post<any>(
        '/api/hccgw/video/v1/live/address/get',
        body,
        {
          headers: {
            'Token': accessToken
          }
        }
      );
      return res.data ? res.data : res;
    };

    let data: any;
    try {
      this.logger.log(`Intentando obtener dirección de transmisión para cámara ${dtoHik.deviceSerial}...`);
      data = await makeRequest(token?.data?.accessToken);

      // Si la respuesta indica un error de código, reintentamos con un nuevo token.
      if (data && data.code !== undefined && data.code !== '0' && data.code !== 0) {
        this.logger.warn(`Respuesta de dirección de transmisión indica código de error: ${data.code}. Refrescando token y reintentando...`);
        token = await this.getToken(true);
        data = await makeRequest(token?.data?.accessToken);
      }
    } catch (err: any) {
      this.logger.warn(`Error en primera consulta de dirección de transmisión: ${err.message}. Intentando refrescar token y reintentar...`);
      try {
        token = await this.getToken(true);
        data = await makeRequest(token?.data?.accessToken);
      } catch (retryErr: any) {
        this.logger.error(`Error definitivo al obtener dirección de transmisión: ${retryErr.message}`);
        throw new HttpException('Error al obtener dirección de transmisión de Hik-Connect', HttpStatus.BAD_GATEWAY);
      }
    }

    const dataDocker = await this.formatDocker(data, dtoHik.suffix);
    if (dataDocker && data.data) {
      data.data.originalUrl = data.data.url;
      data.data.url = dataDocker;
      data.data.duration = body.expireTime;
    }
    return data;
  }

  async formatDocker(data: any, suffix: string = 'a'): Promise<string | null> {
    if (!data?.data?.url) {
      this.logger.warn('No se encontró URL en la respuesta de getOneCamHik');
      return null;
    }

    try {
      const originalUrl = data.data.url;
      const match = originalUrl.match(/\/openlive\/([A-Za-z0-9]+_\d+)/);
      if (!match) {
        this.logger.warn(`No se pudo extraer el identificador de la URL: ${originalUrl}`);
        return null;
      }

      const identifier = match[1]; // L07640755_19
      const pathName = `cam_${identifier}_${suffix}`; // cam_L07640755_19_a o _b

      const host = process.env.MEDIAMTX_HOST || 'localhost';
      const apiPort = process.env.MEDIAMTX_API_PORT || '9997';
      const streamPort = process.env.MEDIAMTX_STREAM_PORT || '8889';
      const user = process.env.MEDIAMTX_API_USER || 'admin_media';
      const pass = process.env.MEDIAMTX_API_PASS || 'adminMultimedia123';

      const baseHost = host.replace(/^https?:\/\//, '');
      const protocol = host.startsWith('https://') ? 'https' : 'http';

      const apiUrl = `${protocol}://${user}:${pass}@${baseHost}:${apiPort}`;
      const streamHost = `${protocol}://${baseHost}:${streamPort}`;

      const encodedPathName = encodeURIComponent(pathName);
      const payload = { source: originalUrl };

      try {
        // Intentamos actualizar (PATCH) si ya existe
        await axios.patch(`${apiUrl}/v3/config/paths/patch/${encodedPathName}`, payload, {
          headers: { 'Content-Type': 'application/json' }
        });
        this.logger.log(`MediaMTX: Ruta '${pathName}' actualizada exitosamente.`);
      } catch (patchErr: any) {
        // Si no existe (404), intentamos agregar (POST)
        if (patchErr.response?.status === 404) {
          try {
            await axios.post(`${apiUrl}/v3/config/paths/add/${encodedPathName}`, payload, {
              headers: { 'Content-Type': 'application/json' }
            });
            this.logger.log(`MediaMTX: Ruta '${pathName}' agregada exitosamente.`);
          } catch (postErr: any) {
            this.logger.error(`MediaMTX: Error al agregar la ruta via POST: ${postErr.message}`);
            return null;
          }
        } else {
          this.logger.error(`MediaMTX: Error al actualizar la ruta via PATCH: ${patchErr.message}`);
          return null;
        }
      }

      // Esperar hasta que el stream esté 'ready' en MediaMTX (máximo 5 segundos)
      let isReady = false;
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        try {
          const resList = await axios.get(`${apiUrl}/v3/paths/list`);
          const paths = resList.data?.items || [];
          const currentPath = paths.find((p: any) => p.name === pathName);
          if (currentPath && currentPath.ready === true) {
            isReady = true;
            this.logger.log(`MediaMTX: Stream '${pathName}' listo y transmitiendo.`);
            break;
          }
        } catch (err) {
          // Ignoramos error y seguimos intentando
        }
      }

      if (!isReady) {
        this.logger.warn(`MediaMTX: Stream '${pathName}' no se reportó listo tras 5 segundos. Continuando igualmente.`);
      }

      return `${streamHost}/${pathName}`;
    } catch (err: any) {
      this.logger.error(`formatDocker error: ${err.message}`);
      return null;
    }
  }

}