import { Injectable, Logger } from '@nestjs/common';
import { GpsBody } from './dto/type';
import { PrismaService } from 'src/prisma/prisma.service';
import { StatusReturn } from '@prisma/client';

@Injectable()
export class GpsService {
    private readonly logger = new Logger(GpsService.name);

    constructor(private prisma: PrismaService) { }

    async receiveTelemetry(body: GpsBody) {
        this.logger.log(`GPS recibido en servicio: ${JSON.stringify(body)}`);

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

        // Obtener la última telemetría registrada para este activo
        const lasTelemetry = await this.prisma.assetTelemetryLog.findFirst({
            where: {
                assetId: asset.id,
            },
            orderBy: {
                recordedAt: 'desc', // Traemos el más reciente
            },
        });

        // 2. Validar que las coordenadas no sean idénticas a las últimas registradas
        if (lasTelemetry && lasTelemetry.latitud === String(body.latitude) && lasTelemetry.longitud === String(body.longitude)) {
            this.logger.warn(`Las coordenadas son idénticas a la última telemetría registrada.`);
            return null;
        }


        // 3. Ejecutar la creación y la actualización en una transacción simultánea
        const [telemetry, updateAsset] = await this.prisma.$transaction(async (tx) => {
            const newTelemetry = await tx.assetTelemetryLog.create({
                data: {
                    assetId: asset.id,
                    latitud: String(body.latitude),
                    longitud: String(body.longitude),
                    speed: String(body.speed),
                    imei: body.imei,
                    recordedAt: body.timestamp ? new Date(body.timestamp) : new Date(),
                },
            });

            // Actualizar el puntero de la última ubicación en el Asset
            const updated = await tx.asset.update({
                where: { id: asset.id },
                data: {
                    lastLocation: newTelemetry.id, // Asignamos el ID real recién creado
                },
            });

            return [newTelemetry, updated];
        });

        /*const telemetry = await this.prisma.assetTelemetryLog.create({
            data: {
                assetId: asset.id,
                latitud: String(body.latitude),
                longitud: String(body.longitude),
                speed: String(body.speed),
                imei: body.imei,
                recordedAt: body.timestamp ? new Date(body.timestamp) : new Date(),
            },
        });*/

        this.logger.warn(`El activo con ID ${asset.id} (IMEI: ${body.imei}) ya fue registrado!!!., `);
        //console.log(telemetry);
        return telemetry;
    }
}