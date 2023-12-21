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
      let content = '';
      global.bot.telegram.sendMessage(
        msg.chat.id,
        'The system is searching ...',
        {
          parse_mode: 'HTML',
        },
      );
      for (const token of cryptoPairs) {
        content += await checkTechnical1h(this, token);
      }
      if (content) {
        global.bot.telegram.sendMessage(msg.chat.id, content, {
          parse_mode: 'HTML',
        });
      } else {
        global.bot.telegram.sendMessage(msg.chat.id, 'No data found!', {
          parse_mode: 'HTML',
        });
      }
    });

    global.bot.command('4h', async (msg) => {
      global.bot.telegram.sendMessage(
        msg.chat.id,
        'The system is searching ...',
        {
          parse_mode: 'HTML',
        },
      );
      let content = '';
      for (const token of cryptoPairs) {
        content += await checkTechnical4h(this, token);
      }
      if (content) {
        global.bot.telegram.sendMessage(msg.chat.id, content, {
          parse_mode: 'HTML',
        });
      } else {
        global.bot.telegram.sendMessage(msg.chat.id, 'No data found!', {
          parse_mode: 'HTML',
        });
      }
    });

    global.bot.command('1d', async (msg) => {
      global.bot.telegram.sendMessage(
        msg.chat.id,
        'The system is searching ...',
        {
          parse_mode: 'HTML',
        },
      );
      let content = '';
      for (const token of cryptoPairs) {
        content += await checkTechnical1d(this, token);
      }
      if (content) {
        global.bot.telegram.sendMessage(msg.chat.id, content, {
          parse_mode: 'HTML',
        });
      } else {
        global.bot.telegram.sendMessage(msg.chat.id, 'No data found!', {
          parse_mode: 'HTML',
        });
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
