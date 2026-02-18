import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'skis', loadComponent: () => import('./pages/skis/skis.component').then(m => m.SkisComponent) },
];
