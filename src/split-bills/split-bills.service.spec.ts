import { Test, TestingModule } from '@nestjs/testing';
import { SplitBillsService } from './split-bills.service';

describe('SplitBillsService', () => {
  let service: SplitBillsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SplitBillsService],
    }).compile();

    service = module.get<SplitBillsService>(SplitBillsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
