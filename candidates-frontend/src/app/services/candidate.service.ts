import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'; 
import { Candidate } from '../interfaces/candidate.interface'; 

@Injectable({
  providedIn: 'root' 
})
export class CandidateService {
  private apiUrl = 'http://localhost:3000/candidates'; 
  constructor(private http: HttpClient) {}

  /**
   * Envía un nuevo candidato (con archivo Excel) al backend.
   * @param formData Objeto FormData que contiene los datos del formulario y el archivo.
   * @returns Un Observable con el candidato creado.
   */
  uploadCandidate(formData: FormData): Observable<Candidate> {
    return this.http.post<Candidate>(`${this.apiUrl}/upload`, formData);
  }

 
}