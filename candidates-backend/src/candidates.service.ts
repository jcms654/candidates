import { Injectable, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx'; 


interface CandidateExcelData {
  Seniority: 'junior' | 'senior';
  'Years of experience': number;
  Availability: boolean;
}

@Injectable()
export class CandidatesService {
  async processCandidate(
    name: string,
    surname: string,
    excelBuffer: Buffer,
  ): Promise<any> {
    try {
      const workbook = XLSX.read(excelBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0]; 
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

      if (!jsonData || jsonData.length < 2) {
        throw new BadRequestException('Excel file must contain at least one row of data.');
      }

      const headers = jsonData[0] as string[]; 
      const rawDataRow = jsonData[1] as string[]; 

      const excelData: Partial<CandidateExcelData> = {};
      headers.forEach((header, index) => {
        const value = rawDataRow[index];
        switch (header.trim()) {
          case 'Seniority':
            excelData.Seniority = value as 'junior' | 'senior';
            break;
          case 'Years of experience':
            excelData['Years of experience'] = parseInt(value, 10);
            break;
          case 'Availability':
            excelData.Availability = String(value).toLowerCase() === 'true' || String(value).toLowerCase() === 'sí' || String(value).toLowerCase() === 'si';
            break;
          default:
            break;
        }
      });

      // Validar que los datos requeridos del excel estén presentes
      if (!excelData.Seniority || excelData['Years of experience'] === undefined || excelData.Availability === undefined) {
        throw new BadRequestException('Missing required data in Excel: Seniority, Years of experience, or Availability.');
      }

      // Combinar los datos y devolverlos
      return {
        name,
        surname,
        seniority: excelData.Seniority,
        years: excelData['Years of experience'],
        availability: excelData.Availability,
      };
    } catch (error) {
      console.error('Error reading Excel file:', error);
      throw new BadRequestException('Error processing Excel file: ' + error.message);
    }
  }
}

