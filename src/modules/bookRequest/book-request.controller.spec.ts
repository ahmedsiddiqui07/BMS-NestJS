import { Test, TestingModule } from '@nestjs/testing';
import { BookRequestController } from './book-request.controller';
import { BookRequestService } from './book-request.service';

describe('BookRequestController', () => {
  let controller: BookRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookRequestController],
      providers: [BookRequestService],
    }).compile();

    controller = module.get<BookRequestController>(BookRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
