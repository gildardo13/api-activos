import { Body, Controller, Post } from '@nestjs/common';
import { HelpersService } from './helpers.service';

@Controller('helpers')
export class HelpersController {
  constructor(private readonly helpersService: HelpersService) {}

  @Post('migrate')
  async migrate(@Body() body: { databaseName: string }) {
    return this.helpersService.runPrismaMigrations(body.databaseName);
  }
}
