import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { InfoExternalService } from './info-external.service';

@Controller('info-external')
export class InfoExternalController {
  constructor(private readonly infoExternalService: InfoExternalService) { }

  @Get('/getCatalogJibby')
  getCatalogJibby() {
    return this.infoExternalService.getCatalogJibby();
  }

  @Get('/getAreas')
  getAreas() {
    return this.infoExternalService.getAreasRh();
  }

  @Get('/getStaff')
  getStaff() {
    return this.infoExternalService.getStaffRh();
  }

  @Get('/getStaffByIdArea/:id')
  getStaffByIdArea(@Param('id') id: string) {
    return this.infoExternalService.getStaffByIdArea(id);
  }


  @Get('/getSubAreas')
  getSubAreas() {
    return this.infoExternalService.getSubAreasRh();
  }

  @Get('/getSubAreasByIdArea/:id')
  getSubAreasByIdArea(@Param('id') id: string) {
    return this.infoExternalService.getSubAreasRhById(id);
  }

  @Get('/getSubMiniAreas/:idArea/:idSubArea')
  getSubMiniAreas(@Param('idArea') idArea: string, @Param('idSubArea') idSubArea: string) {
    return this.infoExternalService.getSubIdMiniSubAreasRh(idArea, idSubArea);
  }

  @Get('/getPositionsByIdArea/:id')
  getPositionsByIdArea(@Param('id') id: string) {
    return this.infoExternalService.getPositionsBySubMiniArea(id);
  }

  @Get('/getCredentailsByUserId/:id')
  getCredentailsByStaffId(@Param('id') id: string) {
    return this.infoExternalService.getCredentailsByStaffId(id);
  }
}

