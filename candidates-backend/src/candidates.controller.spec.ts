import { Test, TestingModule } from '@nestjs/testing';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';
import { BadRequestException } from '@nestjs/common';

describe('CandidatesController', () => {
  let controller: CandidatesController;
  let service: CandidatesService; 

  // --- Mocks de Servicios y Datos ---
  const mockCandidatesService = {
    processCandidate: jest.fn((name: string, surname: string, buffer: Buffer) => {
      return Promise.resolve({ id: 'mockId', name, surname, excelData: 'mocked_excel_data' });
    }),
  };

  // Mock para un archivo Excel subido
  const mockExcelFile: Express.Multer.File = {
    fieldname: 'excelFile',
    originalname: 'test.xlsx',
    encoding: '7bit',
    mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 1024,
    buffer: Buffer.from('mock excel data'),
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidatesController],
      providers: [
        {
          provide: CandidatesService,
          useValue: mockCandidatesService,
        },
      ],
    })
    .compile();

    controller = module.get<CandidatesController>(CandidatesController);
    service = module.get<CandidatesService>(CandidatesService); 
    mockCandidatesService.processCandidate.mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {}); 
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadCandidate', () => {
    
    it('should successfully upload and process a candidate with a file', async () => {
      const name = 'John';
      const surname = 'Doe';
      const result = await controller.uploadCandidate(name, surname, mockExcelFile);
      expect(service.processCandidate).toHaveBeenCalledWith(name, surname, mockExcelFile.buffer);
      expect(result).toEqual({ id: 'mockId', name, surname, excelData: 'mocked_excel_data' });
    });

    it('should throw BadRequestException if name is missing', async () => {
      const name = ''; 
      const surname = 'Doe';
      await expect(controller.uploadCandidate(name, surname, mockExcelFile)).rejects.toThrow(BadRequestException);
      await expect(controller.uploadCandidate(name, surname, mockExcelFile)).rejects.toThrow('Name and Surname are required.');
      expect(service.processCandidate).not.toHaveBeenCalled(); 
    });

    it('should throw BadRequestException if surname is missing', async () => {
      const name = 'John';
      const surname = ''; 
      await expect(controller.uploadCandidate(name, surname, mockExcelFile)).rejects.toThrow(BadRequestException);
      await expect(controller.uploadCandidate(name, surname, mockExcelFile)).rejects.toThrow('Name and Surname are required.');
      expect(service.processCandidate).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if excelFile is missing', async () => {
      const name = 'John';
      const surname = 'Doe';
      const missingFile = undefined as any; 
      await expect(controller.uploadCandidate(name, surname, missingFile)).rejects.toThrow(BadRequestException);
      await expect(controller.uploadCandidate(name, surname, missingFile)).rejects.toThrow('Excel file is required.');
      expect(service.processCandidate).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException and log error if service.processCandidate fails', async () => {
      const name = 'John';
      const surname = 'Doe';
      const error = new Error('Service processing failed');
      mockCandidatesService.processCandidate.mockImplementationOnce(() => Promise.reject(error));
      await expect(controller.uploadCandidate(name, surname, mockExcelFile)).rejects.toThrow(BadRequestException);
      expect(service.processCandidate).toHaveBeenCalledWith(name, surname, mockExcelFile.buffer);
      expect(console.error).toHaveBeenCalledWith('Error processing candidate upload:', error);
    });
  });
});