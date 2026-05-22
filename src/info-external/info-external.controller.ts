import { Controller, Get} from '@nestjs/common';
import { InfoExternalService } from './info-external.service';

@Controller('info-external')
export class InfoExternalController {
  constructor(private readonly infoExternalService: InfoExternalService) { }

  @Get('/getCategoriesJibby')
  getCategoriesJibby() {
    return this.infoExternalService.getCategoriesJibby();
  }

  @Get('/getStaff')
  getStaff() {
    return this.infoExternalService.getStaffRh();
  }
  @Get('/getAreas')
  getAreas() {
    return this.infoExternalService.getAreasRh();
  }

}
