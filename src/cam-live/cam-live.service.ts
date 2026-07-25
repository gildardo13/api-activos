import { Injectable, Logger, HttpException } from '@nestjs/common';
import { CreateCamLiveDto } from './dto/create-cam-live.dto';
import { UpdateCamLiveDto } from './dto/update-cam-live.dto';
import { RequestFlespiStreamDto, RequestStreamBatchDto } from './dto/request-flespi-stream.dto';
import { RequestPlaybackDto, QueryTimelineDto } from './dto/request-playback.dto';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class CamLiveService {
  private readonly logger = new Logger(CamLiveService.name);

  private get apiKey(): string {
    return process.env.X_API_KEY || '';
  }

  private streamApi(): AxiosInstance {
    return axios.create({
      baseURL:
        process.env.CONTROL_ACTIVOS_ENV === 'dev'
          ? process.env.CONTROL_API_STREAM_DEV
          : process.env.CONTROL_ACTIVOS_ENV === 'prod'
            ? process.env.CONTROL_API_STREAM_PROD
            : process.env.CONTROL_API_STREAM_TEST,
      timeout: parseInt(process.env.EXTERNAL_API_TIMEOUT || '10000', 10),
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
  }

  async getCamAllHick() {
    try {
      const res = await this.streamApi().get<any>(
        '/streams/cameras',
        {
          headers: {
            'x-api-key': this.apiKey
          }
        }
      );
      return res.data;
    } catch (err: any) {
      this.logger.warn(`Error en primera consulta de lista de cámaras: ${err.message}.`);
    }
  }

  async solicitar(dto: CreateCamLiveDto) {
    try {
      const res = await this.streamApi().post<any>(
        '/streams/solicitar',
        dto,
        {
          headers: {
            'x-api-key': this.apiKey
          }
        }
      );
      return res.data;
    } catch (err: any) {
      this.logger.warn(`Error al solicitar cámara: ${err.message}.`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Flespi Integration
  // ─────────────────────────────────────────────────────────────────────────────
  async getFlespiDevices() {
    try {
      const res = await this.streamApi().get<any>(
        '/flespi/devices',
        {
          headers: { 'x-api-key': this.apiKey },
        }
      );
      return res.data;
    } catch (err: any) {
      this.logger.warn(`Error en primera consulta de lista de cámaras: ${err.message}.`);
    }
  }

  async requestFlespiLiveStream(dto: RequestFlespiStreamDto) {
    try {
      const res = await this.streamApi().post<any>(
        '/flespi/streams/request',
        dto,
        {
          headers: { 'x-api-key': this.apiKey },
        }
      );
      return res.data;
    } catch (err: any) {
      this.logger.warn(`Error al solicitar cámara: ${err.message}.`);
    }
  }

  async requestFlespiLiveStreamBatch(dto: RequestStreamBatchDto) {
    try {
      const res = await this.streamApi().post<any>(
        '/flespi/streams/request-batch',
        dto,
        {
          headers: { 'x-api-key': this.apiKey },
        }
      );
      return res.data;
    } catch (err: any) {
      this.logger.warn(`Error al solicitar cámara: ${err.message}.`);
    }
  }

  async queryFlespiTimeline(dto: QueryTimelineDto) {
    try {
      const res = await this.streamApi().post<any>(
        '/flespi/streams/timeline',
        dto,
        {
          headers: { 'x-api-key': this.apiKey },
        }
      );
      return res.data;
    } catch (err: any) {
      this.logger.warn(`Error al solicitar cámara: ${err.message}.`);
    }
  }

  async requestFlespiPlayback(dto: RequestPlaybackDto) {
    try {
      const res = await this.streamApi().post<any>(
        '/flespi/streams/playback',
        dto,
        {
          headers: { 'x-api-key': this.apiKey },
        }
      );
      return res.data;
    } catch (err: any) {
      this.logger.warn(`Error al solicitar cámara: ${err.message}.`);
    }
  }

  async getFlespiDeviceMedia(deviceId: string) {
    try {
      const res = await this.streamApi().get<any>(
        `/flespi/devices/${deviceId}/media`,
        {
          headers: { 'x-api-key': this.apiKey },
        }
      );
      return res.data;
    } catch (err: any) {
      this.logger.warn(`Error en primera consulta de lista de cámaras: ${err.message}.`);
    }
  }

  async getFlespiChannels() {
    try {
      const res = await this.streamApi().get<any>(
        '/flespi/channels',
        {
          headers: { 'x-api-key': this.apiKey },
        }
      );
      return res.data;
    } catch (err: any) {
      this.logger.warn(`Error en primera consulta de lista de cámaras: ${err.message}.`);
    }
  }

  async getFlespiDeviceTelemetry(deviceId: string) {
    try {
      const res = await this.streamApi().get<any>(
        `/flespi/devices/${deviceId}/telemetry`,
        {
          headers: { 'x-api-key': this.apiKey },
        }
      );
      return res.data;
    } catch (err: any) {
      this.logger.warn(`Error en primera consulta de lista de cámaras: ${err.message}.`);
    }
  }
  
}
