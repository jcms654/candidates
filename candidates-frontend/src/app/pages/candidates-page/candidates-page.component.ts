import { Component, OnInit, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CandidateFormComponent } from '../../components/candidate-form/candidate-form.component';
import { CandidateTableComponent } from '../../components/candidate-table/candidate-table.component';
import { Candidate } from '../../interfaces/candidate.interface';
import { CandidateService } from '../../services/candidate.service';
import { IndexedDBService } from '../../services/indexed-db.service';

@Component({
  selector: 'app-candidates-page',
  standalone: true,
  imports: [
    CommonModule,
    CandidateFormComponent,
    CandidateTableComponent
  ],
  templateUrl: './candidates-page.component.html', // Ruta al archivo HTML
  styleUrls: ['./candidates-page.component.scss'] // Ruta al archivo SCSS
})
export class CandidatesPageComponent implements OnInit {
  allCandidates: Candidate[] = [];
  candidatesUpdated = new EventEmitter<Candidate[]>();
  constructor(private candidateService: CandidateService, private indexedDBService: IndexedDBService) {}

  ngOnInit(): void {
     this.loadCandidates();
  }

 onCandidatesUpdated(newCandidates: Candidate[]): void {
    this.allCandidates = [...this.allCandidates, ...newCandidates];
  }

 async loadCandidates(): Promise<void> {
    this.allCandidates = await this.indexedDBService.getAllCandidates();
    this.candidatesUpdated.emit(this.allCandidates);
  } 
}