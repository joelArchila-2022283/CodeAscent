import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MapaComponent } from './pages/mapa/mapa.component';
import { HtmlDashboardComponent } from './pages/html/html-dashboard/html-dashboard.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorPageComponent } from './error-page/error-page.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  
  // Redirección de seguridad para cuando el login es exitoso
  { path: 'inicio', redirectTo: 'mapa', pathMatch: 'full' }, 
  
  { path: 'dashboard', component: DashboardComponent },
  { path: 'mapa', component: MapaComponent }, 
  
  // 2. Ruta dinámica que coincide con el pin de tu mapa
  { path: 'curso/html', component: HtmlDashboardComponent }, 
  
  { path: 'error/:type', component: ErrorPageComponent },
  { path: '**', component: NotFoundComponent }
];