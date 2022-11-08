import { Test, TestingModule } from '@nestjs/testing';
import { PlaidController } from './plaid.controller';

describe('PlaidController', () => {
  let controller: PlaidController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaidController],
    }).compile();

    controller = module.get<PlaidController>(PlaidController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
