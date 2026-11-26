import { Test, TestingModule } from '@nestjs/testing';
import { ZoneScoringService } from './zone-scoring.service';

describe('ZoneScoringService', () => {
  let service: ZoneScoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ZoneScoringService],
    }).compile();

    service = module.get<ZoneScoringService>(ZoneScoringService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
