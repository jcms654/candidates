import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'candidates', pathMatch: 'full' },
  {
    path: 'candidates',
    loadComponent: () => import('./pages/candidates-page/candidates-page.component').then(m => m.CandidatesPageComponent)
  },
  { path: '**', redirectTo: 'candidates' }
];