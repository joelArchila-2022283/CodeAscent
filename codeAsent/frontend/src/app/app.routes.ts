import { Routes } from '@angular/router';

import { autenticacionGuard } from './core/guards/autenticacion-guard';
import { rolGuard } from './core/guards/rol-guard';

export const routes: Routes = [
  
  {
    path: 'login',
    // component: LoginComponent
  },

  {
    path: 'inicio',
    // component: InicioComponent,
    canActivate: [autenticacionGuard]
  },

  {
    path: 'admin',
    // component: AdminComponent,
    canActivate: [autenticacionGuard, rolGuard]
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];