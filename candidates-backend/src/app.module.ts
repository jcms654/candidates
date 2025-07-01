import { Module } from '@nestjs/common';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';


@Module({
  imports: [],
  controllers: [CandidatesController],
  providers: [CandidatesService],
})
export class AppModule {}