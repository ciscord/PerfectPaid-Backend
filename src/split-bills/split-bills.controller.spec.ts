import { Test, TestingModule } from '@nestjs/testing';
import { SplitBillsController } from './split-bills.controller';
import { SplitBillsService } from './split-bills.service';

describe('SplitBillsController', () => {
  let controller: SplitBillsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SplitBillsController],
      providers: [SplitBillsService],
    }).compile();

    controller = module.get<SplitBillsController>(SplitBillsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
