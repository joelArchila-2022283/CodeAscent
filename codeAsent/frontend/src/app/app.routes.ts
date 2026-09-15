import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const routes: Routes = [
  // Redirigir la raíz '/' directamente a '/login'
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Ruta del Login
  { path: 'login', component: LoginComponent },

  // Ruta del Registro
  { path: 'registro', component: RegistroComponent },

  // Ruta del Dashboard
  { path: 'dashboard', component: DashboardComponent },

  // Ruta comodín para redirigir cualquier URL desconocida a login
  { path: '**', redirectTo: 'login' }
];