import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';

export const routes: Routes = [
  // Redirigir la raíz '/' directamente a '/login'
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Ruta del Login
  { path: 'login', component: LoginComponent },

  // Ruta comodín para redirigir cualquier URL desconocida a login
  { path: '**', redirectTo: 'login' }
];