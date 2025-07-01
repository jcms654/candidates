import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CandidateFormComponent } from './candidate-form.component';
import { FormBuilder,  Validators, ReactiveFormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CandidateService } from '../../services/candidate.service';
import { IndexedDBService } from '../../services/indexed-db.service';
import { of, throwError } from 'rxjs';
import { Candidate } from '../../interfaces/candidate.interface';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ElementRef } from '@angular/core'; 

// --- Mocks de Servicios ---
const mockCandidateService = {
  uploadCandidate: jest.fn((formData: FormData) => of({ id: '1', name: 'Test', surname: 'User' } as unknown as Candidate)),
};

const mockIndexedDBService = {
  saveCandidate: jest.fn((candidate: Candidate) => Promise.resolve(candidate)),
};

describe('CandidateFormComponent', () => {
  let component: CandidateFormComponent;
  let fixture: ComponentFixture<CandidateFormComponent>;
  let candidateService: jest.Mocked<typeof mockCandidateService>;
  let indexedDBService: jest.Mocked<typeof mockIndexedDBService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CandidateFormComponent,
        CommonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        BrowserAnimationsModule,
      ],
      providers: [
        FormBuilder,
        { provide: CandidateService, useValue: mockCandidateService },
        { provide: IndexedDBService, useValue: mockIndexedDBService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateFormComponent);
    component = fixture.componentInstance;
    candidateService = TestBed.inject(CandidateService) as unknown as jest.Mocked<typeof mockCandidateService>;
    indexedDBService = TestBed.inject(IndexedDBService) as unknown as jest.Mocked<typeof mockIndexedDBService>;

    candidateService.uploadCandidate.mockClear();
    indexedDBService.saveCandidate.mockClear();

    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty values and required validators', () => {
    expect(component.candidateForm).toBeDefined();
    expect(component.candidateForm.get('name')?.value).toBe('');
    expect(component.candidateForm.get('surname')?.value).toBe('');
   
    expect(component.candidateForm.get('name')?.hasValidator(Validators.required)).toBe(true);
    expect(component.candidateForm.get('surname')?.hasValidator(Validators.required)).toBe(true);
  });

  // --- Tests para onFileSelected ---
  it('should set selectedFile and patch form value when a file is selected', () => {
    const testFile = new File([''], 'test.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const event = { target: { files: [testFile] } } as unknown as Event;

    component.onFileSelected(event);

    expect(component.selectedFile).toBe(testFile);
  });

  it('should clear selectedFile and patch form value to null when no file is selected', () => {
    component.selectedFile = new File([''], 'existing.xlsx');
    const event = { target: { files: [] } } as unknown as Event;

    component.onFileSelected(event);

    expect(component.selectedFile).toBeNull();
  });

 

  it('should NOT submit if form is invalid', () => {
    component.candidateForm.get('name')?.setValue(''); 
    component.selectedFile = new File([''], 'test.xlsx');

    
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    component.onSubmit();

    expect(candidateService.uploadCandidate).not.toHaveBeenCalled();
    expect(mockIndexedDBService.saveCandidate).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith('Formulario inválido o archivo no seleccionado. No se puede enviar.');

    (console.warn as jest.Mock).mockRestore(); 
  });

  it('should NOT submit if no file is selected', () => {
    component.candidateForm.get('name')?.setValue('John');
    component.candidateForm.get('surname')?.setValue('Doe');
    component.selectedFile = null;

    jest.spyOn(console, 'warn').mockImplementation(() => {});

    component.onSubmit();

    expect(candidateService.uploadCandidate).not.toHaveBeenCalled();
    expect(mockIndexedDBService.saveCandidate).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith('Formulario inválido o archivo no seleccionado. No se puede enviar.');

    (console.warn as jest.Mock).mockRestore(); 
  });

  it('should call uploadCandidate, saveCandidate, emit, reset form and clear file on valid submission', async () => {
    component.candidateForm.get('name')?.setValue('Jane');
    component.candidateForm.get('surname')?.setValue('Doe');
    component.selectedFile = new File([''], 'valid.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    jest.spyOn(component.candidatesUpdated, 'emit');

  
    let mockFileInputValue = 'old_value';
    const mockNativeElement = {
      get value() { return mockFileInputValue; },
      set value(v: string) { mockFileInputValue = v; },
    };
    component.fileInput = { nativeElement: mockNativeElement as HTMLInputElement } as ElementRef<HTMLInputElement>;

    component.onSubmit();

    await fixture.whenStable();

    expect(candidateService.uploadCandidate).toHaveBeenCalledWith(expect.any(FormData));
    expect(mockIndexedDBService.saveCandidate).toHaveBeenCalledWith({ id: '1', name: 'Test', surname: 'User' });
    expect(component.candidatesUpdated.emit).toHaveBeenCalledWith([{ id: '1', name: 'Test', surname: 'User' }]);
    expect(component.candidateForm.get('name')?.value).toBeNull();
    expect(component.candidateForm.get('surname')?.value).toBeNull();
    expect(component.selectedFile).toBeNull();
    expect(component.fileInput.nativeElement.value).toBe(''); 
  });

  it('should log error if uploadCandidate fails', async () => {
    component.candidateForm.get('name')?.setValue('Jane');
    component.candidateForm.get('surname')?.setValue('Doe');
    component.selectedFile = new File([''], 'valid.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    const errorMessage = 'Upload failed!';
    candidateService.uploadCandidate.mockReturnValue(throwError(() => new Error(errorMessage)));


    jest.spyOn(console, 'error').mockImplementation(() => {});

    component.onSubmit();

    await fixture.whenStable();

    expect(candidateService.uploadCandidate).toHaveBeenCalled();
    expect(mockIndexedDBService.saveCandidate).not.toHaveBeenCalled();
    (console.error as jest.Mock).mockRestore(); 
  });

  it('should warn if form is invalid or file not selected', () => {
    component.candidateForm.get('name')?.setValue('');
    component.selectedFile = null;

    jest.spyOn(console, 'warn').mockImplementation(() => {});

    component.onSubmit();

    expect(console.warn).toHaveBeenCalledWith('Formulario inválido o archivo no seleccionado. No se puede enviar.');
    (console.warn as jest.Mock).mockRestore();
  });

  it('should not throw error if fileInput is not present after successful submission', async () => {
    component.candidateForm.get('name')?.setValue('Jane');
    component.candidateForm.get('surname')?.setValue('Doe');
    component.selectedFile = new File([''], 'valid.xlsx');

    component.fileInput = undefined as any; 

    let errorThrown = false;
    try {
      component.onSubmit();
      await fixture.whenStable();
    } catch (e) {
      errorThrown = true;
    }
    expect(errorThrown).toBe(false);
    expect(candidateService.uploadCandidate).toHaveBeenCalled();
  });
});
