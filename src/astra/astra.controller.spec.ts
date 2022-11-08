import { Test, TestingModule } from '@nestjs/testing';
import { AstraController } from './astra.controller';
import { AstraService } from './astra.service';

describe('AstraController', () => {
  let controller: AstraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AstraController],
      providers: [AstraService],
    }).compile();

    controller = module.get<AstraController>(AstraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
