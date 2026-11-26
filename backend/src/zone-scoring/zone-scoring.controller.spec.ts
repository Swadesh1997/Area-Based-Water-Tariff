import { Test, TestingModule } from '@nestjs/testing';
import { ZoneScoringController } from './zone-scoring.controller';

describe('ZoneScoringController', () => {
  let controller: ZoneScoringController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ZoneScoringController],
    }).compile();

    controller = module.get<ZoneScoringController>(ZoneScoringController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
