import { Test, TestingModule } from '@nestjs/testing';
import { InfoExternalService } from './info-external.service';

describe('InfoExternalService', () => {
  let service: InfoExternalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InfoExternalService],
    }).compile();

    service = module.get<InfoExternalService>(InfoExternalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
