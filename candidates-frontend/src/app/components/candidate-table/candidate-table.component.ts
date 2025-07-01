import { Component, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon'; 
import { CommonModule } from '@angular/common'; 
import { Candidate } from '../../interfaces/candidate.interface'; 

@Component({
  selector: 'app-candidate-table',
  standalone: true, // ¡Componente Standalone!
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './candidate-table.component.html',
  styleUrls: ['./candidate-table.component.scss']
})
export class CandidateTableComponent implements OnChanges, AfterViewInit {
  @Input() candidates: Candidate[] = []; 

  displayedColumns: string[] = ['name', 'surname', 'seniority', 'years', 'availability'];
  dataSource = new MatTableDataSource<Candidate>([]); 

  @ViewChild(MatPaginator) paginator!: MatPaginator;


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['candidates'] && changes['candidates'].currentValue) {
      this.dataSource.data = changes['candidates'].currentValue;
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }
}