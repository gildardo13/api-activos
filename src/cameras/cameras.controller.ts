import { Controller, Get, Param, NotFoundException } from '@nestjs/common';

@Controller('api/camaras')
export class CamerasController {
  
  // Simulamos una base de datos con las dos cámaras de tus vehículos
  private readonly camaras = {
    '1': { 
      id: 1, 
      vehiculo: 'Camión A',
      estatus: 'Activa', 
      url: 'http://localhost:8889/camera/cam1' // Ruta de tu MediaMTX
    },
    '2': { 
      id: 2, 
      vehiculo: 'Camión B',
      estatus: 'Activa', 
      url: 'http://localhost:8889/camera/cam2' // Ruta de tu MediaMTX
    },
    '3': { 
      id: 3, 
      vehiculo: 'Camión C',
      estatus: 'Activa', 
      url: 'http://localhost:8889/camera/cam3' // Ruta de tu MediaMTX
    },
    '4': { 
      id: 4, 
      vehiculo: 'Camión D',
      estatus: 'Activa', 
      url: 'http://localhost:8889/camera/cam4' // Ruta de tu MediaMTX
    },
    '5': { 
      id: 5, 
      vehiculo: 'Camión F',
      estatus: 'Activa', 
      url: 'http://localhost:8889/camera/cam5' // Ruta de tu MediaMTX
    }
  };

  // Endpoint para listar todas las cámaras
  @Get()
  getAllCameras() {
    return Object.values(this.camaras);
  }

  // Ahora recibimos el ID dinámicamente (ej. /api/camaras/1 o /api/camaras/2)
  @Get(':id')
  getVideoUrl(@Param('id') id: string) {
    const camara = this.camaras[id];
    
    if (!camara) {
      throw new NotFoundException(`La cámara con ID ${id} no existe.`);
    }

    return camara;
  }
}
