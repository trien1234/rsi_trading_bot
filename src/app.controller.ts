import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('getCache')
  async getCache() {
    const result = await this.appService.getCache();
    return 1;
  }
}
