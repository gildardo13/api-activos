import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { HelpersModule } from './helpers/helpers.module';
import { SetDatabaseMiddleware } from './middlewares/set-database.middleware';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { MulterModule } from '@nestjs/platform-express';
import { SecondaryPrismaModule } from './prisma/prisma-auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { IntegrationModule } from './common/integration/integration.module';
import { AppController } from './app.controller';

// Asset and related modules
import { AssetsModule } from './assets/assets.module';
import { AssetTypesModule } from './asset-types/asset-types.module';
import { AssetFieldDefinitionsModule } from './asset-field-definitions/asset-field-definitions.module';
import { AssetDocumentsModule } from './asset-documents/asset-documents.module';
import { AssetTelemetryLogsModule } from './asset-telemetry-logs/asset-telemetry-logs.module';
import { AssetGeofencesModule } from './asset-geofences/asset-geofences.module';
import { AssetAssignmentsModule } from './asset-assignments/asset-assignments.module';
import { AssetDocumentChunksModule } from './asset-document-chunks/asset-document-chunks.module';
import { ProjectsModule } from './projects/projects.module';
import { InfoExternalModule } from './info-external/info-external.module';
import { ApprovalFlowsModule } from './approval-flows/approval-flows.module';
import { GpsDeviceModule } from './gps-device/gps-device.module';
import { GpsModule } from './gps/tcp-server.module';
import { ApprovalFlowBodyModule } from './approval-flow-body/approval-flow-body.module';
import { CamerasModule } from './cameras/cameras.module';
import { HikConnectModule } from './hik-connect/hik-connect.module';

@Module({
  controllers: [AppController],
  imports: [
    AuthModule,
    PrismaModule,
    SecondaryPrismaModule,
    HelpersModule,
    MulterModule.register({}),
    CloudinaryModule,
    ScheduleModule.forRoot(),
    IntegrationModule,
    // Registering the new modules
    AssetsModule,
    AssetTypesModule,
    AssetFieldDefinitionsModule,
    AssetDocumentsModule,
    AssetTelemetryLogsModule,
    AssetGeofencesModule,
    AssetAssignmentsModule,
    AssetDocumentChunksModule,
    ProjectsModule,
    InfoExternalModule,
    ApprovalFlowsModule,
    GpsDeviceModule,
    GpsModule,
    ApprovalFlowBodyModule,
    CamerasModule,
    HikConnectModule,
  ],
  providers: [],
})

export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SetDatabaseMiddleware)
      .exclude(
        { path: '/', method: RequestMethod.GET },
        { path: 'api/docs', method: RequestMethod.GET },
        { path: 'api/docs/(.*)', method: RequestMethod.GET },
      )
      .forRoutes('*');
  }
}