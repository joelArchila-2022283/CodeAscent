import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MapaComponent } from './pages/mapa/mapa.component';
import { HtmlDashboardComponent } from './pages/html/html-dashboard/html-dashboard.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorPageComponent } from './error-page/error-page.component';

import { autenticacionGuard } from './core/guards/autenticacion-guard';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  { path: 'registro', component: RegistroComponent },

  {
    path: 'inicio',
    redirectTo: 'mapa',
    pathMatch: 'full'
  },

  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [autenticacionGuard]
  },

  {
    path: 'mapa',
    component: MapaComponent,
    canActivate: [autenticacionGuard]
  },

  {
    path: 'curso/html',
    component: HtmlDashboardComponent,
    canActivate: [autenticacionGuard]
  },

  { path: 'error/:type', component: ErrorPageComponent },

  { path: '**', component: NotFoundComponent }

];