import { Test, TestingModule } from '@nestjs/testing';
import { BiliService } from './bili.service';

describe('BiliService', () => {
  let service: BiliService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BiliService],
    }).compile();

    service = module.get<BiliService>(BiliService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
