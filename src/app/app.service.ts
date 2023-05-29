import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prismaService: PrismaService) {}
  async getRoom() {
    try {
      return await this.prismaService.rooms.findMany();
    } catch (error) {
      throw new HttpException('烂完了!', HttpStatus.NOT_FOUND);
    }
  }
}
