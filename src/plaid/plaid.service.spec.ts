import { Test, TestingModule } from '@nestjs/testing';
import { PlaidService } from './plaid.service';

describe('PlaidService', () => {
  let service: PlaidService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlaidService],
    }).compile();

    service = module.get<PlaidService>(PlaidService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
