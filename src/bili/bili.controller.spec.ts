import { Test, TestingModule } from '@nestjs/testing';
import { BiliController } from './bili.controller';

describe('BiliController', () => {
  let controller: BiliController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BiliController],
    }).compile();

    controller = module.get<BiliController>(BiliController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
