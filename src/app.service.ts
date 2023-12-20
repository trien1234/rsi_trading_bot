import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import {
  checkTechnical1d,
  checkTechnical1h,
  checkTechnical4h,
} from './service';
import { cryptoPairs } from './tokens';
@Injectable()
export class AppService implements OnModuleInit {
  async onModuleInit() {
    global.bot.command('1h', async (msg) => {
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      for (const token of cryptoPairs) {
        await checkTechnical1h(this, token);
        await sleep(1000);
      }
    });

    global.bot.command('4h', async (msg) => {
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      for (const token of cryptoPairs) {
        await checkTechnical4h(this, token);
        await sleep(500);
      }
    });

    global.bot.command('1d', async (msg) => {
      for (const token of cryptoPairs) {
        const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
        await checkTechnical1d(this, token);
        await sleep(500);
      }
    });
  }

  async getTrend() {
    // console.log('getTrend');
    // for (const token of cryptoPairs) {
    //   setTimeout(() => {
    //     checkTechnical1h(this, token);
    //   }, 500);
    // }
  }

  // @Cron(CronExpression.EVERY_HOUR)
  // async getRSI1H() {
  //   console.log('pending job 1h');
  //   for (const token of cryptoPairs) {
  //     setTimeout(() => {
  //       checkTechnical1h(this, token);
  //     }, 500);
  //   }
  // }

  // @Cron(CronExpression.EVERY_DAY_AT_1AM)
  // async getRSI1D() {
  //   console.log('pending job 1d');
  //   for (const token of cryptoPairs) {
  //     setTimeout(() => {
  //       checkTechnical1d(this, token);
  //     }, 500);
  //   }
  // }
}
