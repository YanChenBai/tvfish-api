import { Test, TestingModule } from '@nestjs/testing';
import { DouyuService } from './douyu.service';

describe('DouyuService', () => {
  let service: DouyuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DouyuService],
    }).compile();

    service = module.get<DouyuService>(DouyuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
