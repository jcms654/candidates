import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ElementRef, ViewChild } from '@angular/core';
import { CandidateService } from '../../services/candidate.service';
import { Candidate } from '../../interfaces/candidate.interface';
import { IndexedDBService } from '../../services/indexed-db.service';
import { MatIconModule } from '@angular/material/icon'; 

@Component({
  selector: 'app-candidate-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule 
  ],
  templateUrl: './candidate-form.component.html',
  styleUrls: ['./candidate-form.component.scss']
})
export class CandidateFormComponent implements OnInit {
  candidateForm!: FormGroup;
  selectedFile: File | null = null;
  @Output() candidatesUpdated = new EventEmitter<Candidate[]>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  candidates: Candidate[] = [];

  constructor(private fb: FormBuilder, private candidateService: CandidateService, private indexedDBService: IndexedDBService) {}

  ngOnInit(): void {
    this.candidateForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required]
    });
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.candidateForm.patchValue({ file: this.selectedFile });
      this.candidateForm.get('file')?.updateValueAndValidity();
      this.candidateForm.get('file')?.markAsTouched();
    } else {
      this.selectedFile = null;
      this.candidateForm.patchValue({ file: null });
      this.candidateForm.get('file')?.updateValueAndValidity();
      this.candidateForm.get('file')?.markAsTouched();
    }
  }

  /**
   * Maneja el envío del formulario.
   */
  onSubmit(): void {
    this.candidateForm.markAllAsTouched();
    if (this.candidateForm.valid && this.selectedFile) {
      const formData = new FormData();
      formData.append('name', this.candidateForm.get('name')?.value);
      formData.append('surname', this.candidateForm.get('surname')?.value);
      formData.append('excelFile', this.selectedFile);

      this.candidateService.uploadCandidate(formData).subscribe({
        next: async (newCandidate) => { 
          await this.indexedDBService.saveCandidate(newCandidate);
          this.candidatesUpdated.emit([newCandidate]);
          this.candidateForm.reset();
          this.selectedFile = null;
          if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
          }
          this.candidateForm.markAllAsTouched();
        },
        error: (error) => {
          //console.error('Error al subir el candidato:', error);
        },
      });
    } else {
      console.warn('Formulario inválido o archivo no seleccionado. No se puede enviar.');
    }
  }

}

