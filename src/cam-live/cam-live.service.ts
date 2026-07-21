import { Injectable, Logger } from '@nestjs/common';
import { CreateCamLiveDto } from './dto/create-cam-live.dto';
import { UpdateCamLiveDto } from './dto/update-cam-live.dto';
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
      return res.data
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
      return res.data
    } catch (err: any) {
      this.logger.warn(`Error en primera consulta de lista de cámaras: ${err.message}.`);
    }


  }
}
