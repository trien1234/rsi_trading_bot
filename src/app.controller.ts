import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get('getCache')
  async getCache() {
    const result = await this.appService.getCache();
    return 1;
  }

  @Post('webhook')
  async webhook(@Body() body: any) {
    const result = await this.appService.webhook(body);
    return 1;
  }
}
