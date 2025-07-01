import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CandidateTableComponent } from './candidate-table.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Candidate } from '../../interfaces/candidate.interface';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Component, ViewChild } from '@angular/core'; // Para el componente host de prueba


@Component({
  template: `
    <app-candidate-table [candidates]="testCandidates"></app-candidate-table>
  `,
  standalone: true,
  imports: [CandidateTableComponent]
})
class TestHostComponent {
  testCandidates: Candidate[] = [];
  @ViewChild(CandidateTableComponent) candidateTableComponent!: CandidateTableComponent;
}

describe('CandidateTableComponent', () => {
  let component: CandidateTableComponent;
  let fixture: ComponentFixture<CandidateTableComponent>; 
  let hostComponent: TestHostComponent;
  let hostFixture: ComponentFixture<TestHostComponent>;

  const MOCK_CANDIDATES: Candidate[] = [
    {  name: 'John', surname: 'Doe', seniority: 'junior', years: 1, availability: true },
    {  name: 'Jane', surname: 'Smith', seniority: 'junior', years: 3, availability: false},
    {  name: 'Peter', surname: 'Jones', seniority: 'senior', years: 7, availability: true },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CandidateTableComponent,
        TestHostComponent, // Importa el componente host
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatCardModule,
        MatIconModule,
        BrowserAnimationsModule,
      ],
    }).compileComponents();

    hostFixture = TestBed.createComponent(TestHostComponent);
    hostComponent = hostFixture.componentInstance;
    hostFixture.detectChanges();
    component = hostComponent.candidateTableComponent;
  
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize dataSource with empty data', () => {
    expect(component.dataSource).toBeInstanceOf(MatTableDataSource);
    expect(component.dataSource.data).toEqual([]);
  });

  it('should set paginator in ngAfterViewInit', () => {  
    expect(component.dataSource.paginator).toBeDefined();
    expect(component.dataSource.paginator).toBeInstanceOf(MatPaginator);
  });

  it('should update dataSource data and paginator on candidates input change (ngOnChanges)', () => {
    hostComponent.testCandidates = MOCK_CANDIDATES;
    hostFixture.detectChanges(); 

    expect(component.dataSource.data).toEqual(MOCK_CANDIDATES);
    expect(component.dataSource.paginator).toBeDefined(); 
  });

  it('should update dataSource data when candidates input changes to empty array', () => {
    hostComponent.testCandidates = MOCK_CANDIDATES;
    hostFixture.detectChanges();

    hostComponent.testCandidates = [];
    hostFixture.detectChanges();

    expect(component.dataSource.data).toEqual([]);
  });

  it('should correctly display columns', () => {
    expect(component.displayedColumns).toEqual(['name', 'surname', 'seniority', 'years', 'availability']);
  });
});