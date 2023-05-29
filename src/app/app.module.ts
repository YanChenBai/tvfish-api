import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NestLogsModule } from 'nest-logs';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { BiliModule } from '../bili/bili.module';
import { DouyuModule } from '../douyu/douyu.module';
import { BiliService } from 'src/bili/bili.service';
import { DouyuService } from 'src/douyu/douyu.service';

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    NestLogsModule,
    BiliModule,
    DouyuModule,
  ],
  controllers: [AppController],
  providers: [AppService, BiliService, DouyuService],
})
export class AppModule {}
