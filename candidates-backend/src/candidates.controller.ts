import { Controller, Post, Body, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CandidatesService } from './candidates.service';
import { Express } from 'express'; 

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('excelFile')) 
  async uploadCandidate(
    @Body('name') name: string,
    @Body('surname') surname: string,
    @UploadedFile() excelFile: Express.Multer.File, 
  ) {
    if (!name || !surname) {
      throw new BadRequestException('Name and Surname are required.');
    }
    if (!excelFile) {
      throw new BadRequestException('Excel file is required.');
    }
    try {
      const combinedData = await this.candidatesService.processCandidate(
        name,
        surname,
        excelFile.buffer, 
      );
      return combinedData;
    } catch (error) {
      console.error('Error processing candidate upload:', error);
      throw new BadRequestException('Failed to process candidate data: ' + error.message);
    }
  }
}
