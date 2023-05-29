import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from '../prisma/prisma.service';
import { GetOrigin, RoomInfo } from './app.dto';
import { BiliService } from '../bili/bili.service';
import { DouyuService } from '../douyu/douyu.service';
import { Success } from 'src/utils/response';
import { NestLogger } from 'nest-logs';

@NestLogger()
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaService,
    private readonly biliService: BiliService,
    private readonly douyuService: DouyuService,
  ) {}

  @Post('/room/add')
  async add(@Body() pamas: RoomInfo) {
    switch (pamas.type) {
      case 'douyu':
        return Success(await this.douyuService.addLiveRoom(pamas.roomId));
      case 'bili':
        return Success(await this.biliService.addLiveRoom(pamas.roomId));
    }
  }

  @Get('/room')
  async get() {
    return Success(await this.appService.getRoom());
  }

  @Get('/live')
  async live(@Query() pamas: GetOrigin) {
    switch (pamas.type) {
      case 'douyu':
        return Success(
          await this.douyuService.getOrigin(pamas.roomId, pamas.qn, pamas.line),
        );
      case 'bili':
        return Success(
          await this.biliService.getOrigin(
            pamas.roomId,
            pamas.qn,
            Number(pamas.line),
          ),
        );
    }
  }

  @Get('/room/info')
  async info(@Query() pamas: RoomInfo) {
    switch (pamas.type) {
      case 'douyu':
        return Success(await this.douyuService.getLiveRoomInfo(pamas.roomId));
        break;
      case 'bili':
        return Success(await this.biliService.getLiveRoomInfo(pamas.roomId));
    }
  }
}
