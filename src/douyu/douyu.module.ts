import { Module } from '@nestjs/common';
import { DouyuController } from './douyu.controller';
import { DouyuService } from './douyu.service';
@Module({
  providers: [DouyuService],
  controllers: [DouyuController],
})
export class DouyuModule {}
