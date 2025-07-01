import { Test, TestingModule } from '@nestjs/testing';
import { CandidatesService } from './candidates.service';
import { BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx'; 

jest.mock('xlsx', () => ({
  read: jest.fn(() => ({
    SheetNames: ['Sheet1'],
    Sheets: {
      Sheet1: {},
    },
  })),
  utils: {
    sheet_to_json: jest.fn(() => []),
  },
}));

describe('CandidatesService', () => {
  let service: CandidatesService;
  let xlsxReadSpy: jest.Mock;
  let xlsxSheetToJsonSpy: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CandidatesService],
    }).compile();

     service = module.get<CandidatesService>(CandidatesService);

    xlsxReadSpy = XLSX.read as jest.Mock;
    xlsxSheetToJsonSpy = XLSX.utils.sheet_to_json as jest.Mock;

    xlsxReadSpy.mockClear();
    xlsxSheetToJsonSpy.mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suprime console.error
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore(); // Restaura console.error
  });

  // --- Datos de Prueba Comunes ---
  const mockName = 'John';
  const mockSurname = 'Doe';
  const mockBuffer = Buffer.from('fake excel data'); 

  // --- Tests ---
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processCandidate', () => {
    it('should successfully process a valid Excel file and combine data', async () => {
      // Configura el mock de sheet_to_json para devolver datos válidos
      xlsxSheetToJsonSpy.mockReturnValueOnce([
        ['Seniority', 'Years of experience', 'Availability'],
        ['junior', '3', 'true'], 
      ]);
      const result = await service.processCandidate(mockName, mockSurname, mockBuffer);
      expect(xlsxReadSpy).toHaveBeenCalledWith(mockBuffer, { type: 'buffer' });
      expect(xlsxSheetToJsonSpy).toHaveBeenCalledWith(expect.any(Object), { header: 1, raw: false });
	    expect(result).toEqual({
        name: mockName,
        surname: mockSurname,
        seniority: 'junior',
        years: 3,
        availability: true,
      });
	
    });

    it('should handle "false" for Availability as false', async () => {
      xlsxSheetToJsonSpy.mockReturnValueOnce([
        ['Seniority', 'Years of experience', 'Availability'],
        ['junior', '2', 'false'],
      ]);
      const result = await service.processCandidate(mockName, mockSurname, mockBuffer);
      expect(result.availability).toBe(false);
    });

    it('should throw BadRequestException if Excel file has no data rows', async () => {
      xlsxSheetToJsonSpy.mockReturnValueOnce([
        ['Seniority', 'Years of experience', 'Availability'], 
      ]);
      await expect(service.processCandidate(mockName, mockSurname, mockBuffer)).rejects.toThrow(BadRequestException);
      await expect(service.processCandidate(mockName, mockSurname, mockBuffer)).rejects.toThrow('Excel file must contain at least one row of data.');
    });

    it('should throw BadRequestException if required data (Seniority) is missing in Excel', async () => {
      xlsxSheetToJsonSpy.mockReturnValueOnce([
        ['Years of experience', 'Availability'], 
        ['4', 'true'],
      ]);
      await expect(service.processCandidate(mockName, mockSurname, mockBuffer)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if required data (Years of experience) is missing in Excel', async () => {
      xlsxSheetToJsonSpy.mockReturnValueOnce([
        ['Seniority', 'Availability'], 
        ['senior', 'true'],
      ]);
      await expect(service.processCandidate(mockName, mockSurname, mockBuffer)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if required data (Availability) is missing in Excel', async () => {
      xlsxSheetToJsonSpy.mockReturnValueOnce([
        ['Seniority', 'Years of experience'], 
        ['junior', '1'],
     ]);
      await expect(service.processCandidate(mockName, mockSurname, mockBuffer)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if XLSX.read fails', async () => {
      const readError = new Error('Invalid Excel file format');
      xlsxReadSpy.mockImplementationOnce(() => {
        throw readError; 
      });
      await expect(service.processCandidate(mockName, mockSurname, mockBuffer)).rejects.toThrow(BadRequestException);
      expect(console.error).toHaveBeenCalledWith('Error reading Excel file:', readError);
    });

    it('should throw BadRequestException if XLSX.utils.sheet_to_json fails', async () => {
      const jsonError = new Error('Sheet to JSON conversion failed');
      xlsxSheetToJsonSpy.mockImplementationOnce(() => {
        throw jsonError; 
      });
      await expect(service.processCandidate(mockName, mockSurname, mockBuffer)).rejects.toThrow(BadRequestException);
      expect(console.error).toHaveBeenCalledWith('Error reading Excel file:', jsonError);
    });
  });
});