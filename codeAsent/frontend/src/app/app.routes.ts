import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MapaComponent } from './pages/mapa/mapa.component';
import { SqlComponent } from './pages/sql/sql.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorPageComponent } from './error-page/error-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'mapa', component: MapaComponent },
  { path: 'sql', component: SqlComponent },
  { path: 'curso/sql', component: SqlComponent },
  { path: 'error/:type', component: ErrorPageComponent },
  { path: '**', component: NotFoundComponent }
];