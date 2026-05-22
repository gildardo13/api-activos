import { Test, TestingModule } from '@nestjs/testing';
import { InfoExternalController } from './info-external.controller';
import { InfoExternalService } from './info-external.service';

describe('InfoExternalController', () => {
  let controller: InfoExternalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InfoExternalController],
      providers: [InfoExternalService],
    }).compile();

    controller = module.get<InfoExternalController>(InfoExternalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
