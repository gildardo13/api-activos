import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import * as net from 'net';
import * as fs from 'fs';
import * as path from 'path';
import { parseAvlData } from './helpers/teltonika-parser';
import { PrismaService } from 'src/prisma/prisma.service';
import { StatusReturn } from '@prisma/client';
import { GpsBody } from './dto/type';

@Injectable()
export class GpsService implements OnApplicationBootstrap, OnModuleDestroy {
    private readonly logger = new Logger(GpsService.name);
    private server: net.Server;

    constructor(private prisma: PrismaService) { }

    private logToFile(message: string) {
        try {
            const logPath = path.resolve(process.cwd(), 'gps-connections.log');
            const timestamp = new Date().toISOString();
            fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
        } catch (err) {
            // Ignore error writing to log
        }
    }

    onApplicationBootstrap() {
        const port = process.env.GPS_TCP_PORT ? parseInt(process.env.GPS_TCP_PORT, 10) : 2102;
        
        this.server = net.createServer((socket) => {
            const remoteAddress = `${socket.remoteAddress}:${socket.remotePort}`;
            this.logger.log(`Nueva conexión TCP GPS establecida desde ${remoteAddress}`);
            
            let deviceImei: string | null = null;
            let bufferAccumulator = Buffer.alloc(0);

            socket.on('data', async (data) => {
                this.logger.debug(`[TCP GPS] Datos recibidos de ${remoteAddress}: ${data.toString('hex')}`);
                this.logToFile(`[TCP GPS] Datos recibidos de ${remoteAddress}: ${data.toString('hex')}`);
                bufferAccumulator = Buffer.concat([bufferAccumulator, data]);

                // Procesar el acumulador en bucle ya que pueden llegar múltiples tramas o tramas fragmentadas
                while (bufferAccumulator.length > 0) {
                    if (deviceImei === null) {
                        // Esperando paquete de Handshake de IMEI
                        if (bufferAccumulator.length < 2) {
                            break; // Esperar más datos
                        }
                        const imeiLen = bufferAccumulator.readUInt16BE(0);
                        if (imeiLen < 8 || imeiLen > 30) {
                            // Longitud de IMEI inválida, probablemente ruido o protocolo corrupto
                            this.logger.warn(`[TCP GPS] Longitud de IMEI inválida recibida de ${remoteAddress}: ${imeiLen}. Cerrando socket.`);
                            socket.destroy();
                            break;
                        }
                        if (bufferAccumulator.length < 2 + imeiLen) {
                            break; // Esperar más datos
                        }
                        
                        const imei = bufferAccumulator.toString('ascii', 2, 2 + imeiLen);
                        
                        try {
                            const deviceGps = await this.prisma.gpsDevice.findUnique({
                                where: { imei },
                            });
                            if (!deviceGps) {
                                this.logger.warn(`[TCP GPS] Dispositivo no autorizado con IMEI: ${imei} desde ${remoteAddress}. Cerrando conexión.`);
                                this.logToFile(`[TCP GPS] Dispositivo no autorizado con IMEI: ${imei} desde ${remoteAddress}. Cerrando conexión.`);
                                socket.destroy();
                                break;
                            }
                        } catch (err) {
                            this.logger.error(`[TCP GPS] Error al verificar el IMEI ${imei} desde ${remoteAddress}: ${err.message}`);
                            socket.destroy();
                            break;
                        }

                        deviceImei = imei;
                        this.logger.log(`[TCP GPS] IMEI verificado y recibido de ${remoteAddress}: ${deviceImei}`);
                        this.logToFile(`[TCP GPS] IMEI verificado y recibido de ${remoteAddress}: ${deviceImei}`);

                        // Responder aceptación de IMEI (1 byte con valor 0x01)
                        socket.write(Buffer.from([0x01]));

                        // Cortar el acumulador para quitar el handshake de IMEI
                        bufferAccumulator = bufferAccumulator.slice(2 + imeiLen);
                    } else {
                        // Esperando tramas de datos AVL
                        if (bufferAccumulator.length < 8) {
                            break; // Esperar más datos (preámbulo 4 bytes + longitud 4 bytes)
                        }

                        // Validar preámbulo (debe ser 0x00000000)
                        const preamble = bufferAccumulator.readUInt32BE(0);
                        if (preamble !== 0) {
                            this.logger.warn(`[TCP GPS] Preámbulo inválido (${preamble}) de ${deviceImei}. Buscando siguiente límite.`);
                            // Intentar recuperar buscando el siguiente preámbulo en el acumulador
                            const index = bufferAccumulator.indexOf(Buffer.from([0, 0, 0, 0]));
                            if (index !== -1) {
                                bufferAccumulator = bufferAccumulator.slice(index);
                                continue;
                            } else {
                                // Sin preámbulo válido y buffer grande: vaciar para evitar fugas de memoria
                                if (bufferAccumulator.length > 1024) {
                                    bufferAccumulator = Buffer.alloc(0);
                                }
                                break;
                            }
                        }

                        // Obtener longitud del campo de datos
                        const dataLength = bufferAccumulator.readUInt32BE(4);
                        const expectedLength = 8 + dataLength + 4; // 8 (preámbulo + longitud) + datos + 4 (CRC)

                        if (bufferAccumulator.length < expectedLength) {
                            break; // El paquete está incompleto, esperar más datos
                        }

                        // Extraer el paquete completo y reajustar acumulador
                        const packet = bufferAccumulator.slice(0, expectedLength);
                        bufferAccumulator = bufferAccumulator.slice(expectedLength);

                        try {
                            console.log(packet)
                            const parsed = parseAvlData(packet);
                            this.logger.log(`[TCP GPS] Objeto parsed completo: ${JSON.stringify(parsed, null, 2)}`);
                            if (parsed) {
                                this.logger.log(`[TCP GPS] Procesando ${parsed.recordsCount} registros AVL para IMEI: ${deviceImei}`);
                                this.logToFile(`[TCP GPS] Procesando ${parsed.recordsCount} registros AVL para IMEI: ${deviceImei}`);
                                for (const record of parsed.records) {
                                    await this.processTelemetryRecord(deviceImei, record);
                                }
                                // Responder con el número de registros aceptados (4 bytes big-endian)
                                const ack = Buffer.alloc(4);
                                ack.writeUInt32BE(parsed.recordsCount, 0);
                                socket.write(ack);
                            } else {
                                this.logger.warn(`[TCP GPS] Fallo al decodificar AVL para IMEI: ${deviceImei}`);
                                this.logToFile(`[TCP GPS] WARN: Fallo al decodificar AVL para IMEI: ${deviceImei}`);
                            }
                        } catch (err) {
                            this.logger.error(`[TCP GPS] Error procesando AVL para IMEI ${deviceImei}: ${err.message}`, err.stack);
                        }
                    }
                }
            });

            socket.on('close', () => {
                this.logger.log(`[TCP GPS] Conexión cerrada desde ${remoteAddress} (IMEI: ${deviceImei || 'Desconocido'})`);
                this.logToFile(`[TCP GPS] Conexión cerrada desde ${remoteAddress} (IMEI: ${deviceImei || 'Desconocido'})`);
            });

            socket.on('error', (err) => {
                this.logger.error(`[TCP GPS] Error en socket ${remoteAddress} (IMEI: ${deviceImei || 'Desconocido'}): ${err.message}`);
                this.logToFile(`[TCP GPS] ERROR en socket ${remoteAddress} (IMEI: ${deviceImei || 'Desconocido'}): ${err.message}`);
            });
        });

        this.server.listen(port, '0.0.0.0', () => {
            this.logger.log(`[TCP GPS] Servidor TCP escuchando en el puerto ${port}`);
            this.logToFile(`[TCP GPS] Servidor TCP escuchando en el puerto ${port}`);
        });
    }

    onModuleDestroy() {
        if (this.server) {
            this.server.close(() => {
                this.logger.log('[TCP GPS] Servidor TCP detenido.');
            });
        }
    }

    /**
     * Procesa un único registro de telemetría decodificado desde la trama TCP del GPS.
     */
    async processTelemetryRecord(
        imei: string, 
        record: { 
            timestamp: Date; 
            latitude: number; 
            longitude: number; 
            speed: number; 
            din1?: number | null;
            din2?: number | null;
            dout1?: number | null;
            ain1?: number | null;
            ignition?: number | null;
        }
    ) {
        const deviceGps = await this.prisma.gpsDevice.findUnique({
            where: { imei },
        });

        if (!deviceGps) {
            this.logger.warn(`[TCP GPS] Dispositivo con IMEI ${imei} no registrado en la base de datos.`);
            this.logToFile(`[TCP GPS] WARN [${imei}]: Dispositivo no registrado en la base de datos.`);
            return;
        }

        const asset = await this.prisma.asset.findFirst({
            where: { gpsDeviceId: deviceGps.id },
        });

        if (!asset) {
            this.logger.warn(`[TCP GPS] El GPS con ID ${deviceGps.id} (IMEI: ${imei}) no está asignado a ningún activo.`);
            this.logToFile(`[TCP GPS] WARN [${imei}]: El GPS con ID ${deviceGps.id} no está asignado a ningún activo.`);
            return;
        }

        const assetAssignment = await this.prisma.assetAssignment.findFirst({
            where: {
                assetId: asset.id,
                OR: [
                    {
                        statusReturned: {
                            in: [StatusReturn.IN_USE, StatusReturn.PENDING],
                        },
                    },
                    {
                        statusReturned: null,
                    },
                ],
            },
        });

        if (!assetAssignment) {
            this.logger.warn(`[TCP GPS] El activo con ID ${asset.id} (IMEI: ${imei}) no tiene una asignación activa. Telemetría omitida.`);
            this.logToFile(`[TCP GPS] WARN [${imei}]: El activo con ID ${asset.id} no tiene una asignación activa. Telemetría omitida.`);
            return;
        }

        // Obtener la última telemetría registrada para este activo
        const lastTelemetry = await this.prisma.assetTelemetryLog.findFirst({
            where: {
                assetId: asset.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (lastTelemetry) {
            // Validar que las coordenadas no sean idénticas a las últimas registradas,
            // a menos que haya algún cambio de estado relevante (ignición, velocidad, o E/S).
            const isLocationIdentical = lastTelemetry.latitud === String(record.latitude) && lastTelemetry.longitud === String(record.longitude);
            const hasStateChanged = 
                lastTelemetry.speed !== String(record.speed) ||
                lastTelemetry.ignition !== record.ignition ||
                lastTelemetry.din1 !== record.din1 ||
                lastTelemetry.din2 !== record.din2 ||
                lastTelemetry.dout1 !== record.dout1 ||
                lastTelemetry.ain1 !== record.ain1;

            if (isLocationIdentical && !hasStateChanged) {
                this.logger.warn(`[TCP GPS] Coordenadas y estados idénticos (${record.latitude}, ${record.longitude}) para el activo ${asset.id} (IMEI: ${imei}). Telemetría omitida.`);
                this.logToFile(`[TCP GPS] WARN [${imei}]: Coordenadas y estados idénticos (${record.latitude}, ${record.longitude}) para el activo ${asset.id}. Telemetría omitida.`);
                return;
            }

            //VALIDADOR IMPOSIBLE DE SALTO DE KM
            const lat1 = parseFloat(lastTelemetry.latitud);
            const lon1 = parseFloat(lastTelemetry.longitud);
            const lat2 = record.latitude;
            const lon2 = record.longitude;

            const distanceKm = this.getDistanceKm(lat1, lon1, lat2, lon2);
            const timeDiffSeconds = Math.abs((record.timestamp.getTime() - lastTelemetry.recordedAt.getTime()) / 1000);

            if (timeDiffSeconds > 0) {
                const speedKmh = (distanceKm / (timeDiffSeconds / 3600));
                // Si la velocidad implícita es mayor a 250 km/h y el salto es de más de 1.5 km, es un salto irreal de GPS
                if (speedKmh > 250 && distanceKm > 1.5) {
                    this.logger.warn(`[TCP GPS] Salto de coordenadas imposible descartado para el activo ${asset.name} (IMEI: ${imei}). Distancia: ${distanceKm.toFixed(2)} km en ${timeDiffSeconds}s (Velocidad implícita: ${speedKmh.toFixed(2)} km/h).`);
                    this.logToFile(`[TCP GPS] WARN [${imei}]: Salto imposible descartado. Distancia: ${distanceKm.toFixed(2)} km en ${timeDiffSeconds}s.`);
                    return;
                }
            }
             //VALIDADOR IMPOSIBLE DE SALTO DE KM
        }

        // Ejecutar creación y actualización en transacción
        await this.prisma.$transaction(async (tx) => {
            const newTelemetry = await tx.assetTelemetryLog.create({
                data: {
                    assetId: asset.id,
                    latitud: String(record.latitude),
                    longitud: String(record.longitude),
                    speed: String(record.speed),
                    imei: imei,
                    din1: record.din1,
                    din2: record.din2,
                    dout1: record.dout1,
                    ain1: record.ain1,
                    ignition: record.ignition,
                    recordedAt: record.timestamp,
                },
            });

            await tx.asset.update({
                where: { id: asset.id },
                data: {
                    lastLocation: newTelemetry.id,
                },
            });
        });

        this.logger.log(`[TCP GPS] Telemetría registrada exitosamente para el activo ${asset.name} (IMEI: ${imei})`);
        this.logToFile(`[TCP GPS] LOG [${imei}]: Telemetría registrada exitosamente para el activo ${asset.name} (Lat: ${record.latitude}, Lng: ${record.longitude})`);
    }

    /**
     * Mantiene compatibilidad con el endpoint REST anterior.
     */
    async receiveTelemetry(body: GpsBody) {
        this.logger.log(`GPS recibido en servicio REST: ${JSON.stringify(body)}`);

        const deviceGps = await this.prisma.gpsDevice.findUnique({
            where: { imei: body.imei },
        });

        if (!deviceGps) {
            this.logger.warn(`Dispositivo con IMEI ${body.imei} no registrado.`);
            return null;
        }

        const asset = await this.prisma.asset.findFirst({
            where: { gpsDeviceId: deviceGps.id },
        });

        if (!asset) {
            this.logger.warn(`El GPS con ID ${deviceGps.id} (IMEI: ${body.imei}) no está asignado a ningún activo.`);
            return null;
        }
        const assetAssignment = await this.prisma.assetAssignment.findFirst({
            where: {
                assetId: asset.id,
                OR: [
                    {
                        statusReturned: {
                            in: [StatusReturn.IN_USE, StatusReturn.PENDING],
                        },
                    },
                    {
                        statusReturned: null,
                    },
                ],
            },
        });
        if (!assetAssignment) {
            this.logger.warn(`El activo con ID ${asset.id} (IMEI: ${body.imei}) no tiene una asignación activa.`);
            return null;
        }

        const lasTelemetry = await this.prisma.assetTelemetryLog.findFirst({
            where: {
                assetId: asset.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        if (lasTelemetry) {
            const isLocationIdentical = lasTelemetry.latitud === String(body.latitude) && lasTelemetry.longitud === String(body.longitude);
            const hasStateChanged = 
                lasTelemetry.speed !== String(body.speed) ||
                lasTelemetry.ignition !== body.ignition ||
                lasTelemetry.din1 !== body.din1 ||
                lasTelemetry.din2 !== body.din2 ||
                lasTelemetry.dout1 !== body.dout1 ||
                lasTelemetry.ain1 !== body.ain1;

            if (isLocationIdentical && !hasStateChanged) {
                this.logger.warn(`Las coordenadas y estados son idénticas a la última telemetría registrada.`);
                return null;
            }
        }

        const [telemetry, updateAsset] = await this.prisma.$transaction(async (tx) => {
            const newTelemetry = await tx.assetTelemetryLog.create({
                data: {
                    assetId: asset.id,
                    latitud: String(body.latitude),
                    longitud: String(body.longitude),
                    speed: String(body.speed),
                    imei: body.imei,
                    din1: body.din1,
                    din2: body.din2,
                    dout1: body.dout1,
                    ain1: body.ain1,
                    ignition: body.ignition,
                    recordedAt: body.timestamp ? new Date(body.timestamp) : new Date(),
                },
            });

            const updated = await tx.asset.update({
                where: { id: asset.id },
                data: {
                    lastLocation: newTelemetry.id,
                },
            });

            return [newTelemetry, updated];
        });

        this.logger.log(`El activo con ID ${asset.id} (IMEI: ${body.imei}) ya fue registrado!!!.`);
        return telemetry;
    }

    private getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radio de la Tierra en kilómetros
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}