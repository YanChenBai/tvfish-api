import { Test, TestingModule } from '@nestjs/testing';
import { DouyuController } from './douyu.controller';

describe('DouyuController', () => {
  let controller: DouyuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DouyuController],
    }).compile();

    controller = module.get<DouyuController>(DouyuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
