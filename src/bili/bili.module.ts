import { Module } from '@nestjs/common';
import { BiliController } from './bili.controller';
import { BiliService } from './bili.service';

@Module({
  providers: [BiliService],
  controllers: [BiliController],
})
export class BiliModule {}
