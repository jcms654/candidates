import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CandidateService } from './candidate.service';
import { Candidate } from '../interfaces/candidate.interface'; // Asegúrate de que la ruta sea correcta

describe('CandidateService', () => {
  let service: CandidateService;
  let httpTestingController: HttpTestingController; // Para controlar las solicitudes HTTP mockeadas
  const apiUrl = 'http://localhost:3000/candidates';
 
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Importa el módulo de testing HTTP
      providers: [CandidateService]
    });

    service = TestBed.inject(CandidateService);
    httpTestingController = TestBed.inject(HttpTestingController); // Obtiene el controlador de testing
  });

  // Después de cada test, verifica que no haya solicitudes HTTP pendientes
  afterEach(() => {
    httpTestingController.verify();
  });

  // Test 1: El servicio debe ser creado correctamente
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Test 2: `uploadCandidate` debería realizar una solicitud POST y retornar un candidato
  it('should send a POST request to upload a candidate', () => {
    const mockCandidate: Candidate = {
      id: 1,
      name: 'John',
      surname: 'Doe',
      email: 'john.doe@example.com',
      seniority: 'Senior',
      experienceYears: 5,
      availability: 'Full-time'
    };
    const mockFormData = new FormData();
    mockFormData.append('name', 'John');
    mockFormData.append('surname', 'Doe');
    // Normalmente aquí añadirías un archivo Excel, pero para el test no es estrictamente necesario
    // simular el contenido del archivo en el FormData, solo que el método lo recibe.

    // Suscribe al Observable para disparar la solicitud HTTP
    service.uploadCandidate(mockFormData).subscribe(candidate => {
      expect(candidate).toEqual(mockCandidate); // Verifica que el candidato retornado es el esperado
    });

    // Espera una solicitud POST a la URL específica
    const req = httpTestingController.expectOne(`${apiUrl}/upload`);

    // Verifica que la solicitud sea de tipo POST
    expect(req.request.method).toEqual('POST');

    // Verifica que el cuerpo de la solicitud sea FormData (no podemos inspeccionar FormData directamente
    // de forma fácil, pero podemos verificar el tipo y cabeceras si fueran importantes).
    expect(req.request.body).toBeInstanceOf(FormData);

    // Responde a la solicitud mockeada con los datos de ejemplo
    req.flush(mockCandidate);
  });

  // Test 3: `uploadCandidate` debería manejar errores HTTP
  it('should handle HTTP errors for uploadCandidate', () => {
    const errorMessage = 'Error al subir el candidato';
    const mockFormData = new FormData();
    mockFormData.append('name', 'Test');

    service.uploadCandidate(mockFormData).subscribe({
      next: () => fail('Se esperaba un error, pero la solicitud fue exitosa'), // Si llega aquí, el test falla
      error: error => {
        expect(error.status).toBe(500); // Verifica el código de estado del error
        expect(error.statusText).toBe('Server Error'); // Verifica el texto del estado
      }
    });

    const req = httpTestingController.expectOne(`${apiUrl}/upload`);
    req.error(new ProgressEvent('error'), { status: 500, statusText: 'Server Error' }); // Simula un error de red o de servidor
  });
});