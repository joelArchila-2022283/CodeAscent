import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MapaComponent } from './pages/mapa/mapa.component';
import { HtmlDashboardComponent } from './pages/html/html-dashboard/html-dashboard.component';
import { SqlComponent } from './pages/sql/sql.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorPageComponent } from './error-page/error-page.component';
import { RecuperarPasswordComponent } from './pages/recuperar-password/recuperar-password';
import { RestaurarPasswordComponent } from './pages/restaurar-password/restaurar-password';

// 1. Importamos los guardianes que protegerán las rutas
import { authGuard, guestGuard } from './core/guards/auth-guard'; 

// TODO: Tus compañeros deben descomentar estas importaciones cuando creen los componentes
// import { CssComponent } from './pages/css/css.component';
// import { TypescriptComponent } from './pages/typescript/typescript.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Rutas PÚBLICAS 
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'registro', component: RegistroComponent, canActivate: [guestGuard] },
  
  // Redirección de seguridad para cuando el login es exitoso
  { path: 'inicio', redirectTo: 'mapa', pathMatch: 'full' },

  // Rutas PRIVADAS
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'mapa', component: MapaComponent, canActivate: [authGuard] },
  { path: 'curso/html', component: HtmlDashboardComponent, canActivate: [authGuard] },
  { path: 'sql', component: SqlComponent, canActivate: [authGuard] },
  { path: 'curso/sql', component: SqlComponent, canActivate: [authGuard] },
  { path: 'recuperar-password', component: RecuperarPasswordComponent, canActivate: [guestGuard] },
  { path: 'restaurar-password', component: RestaurarPasswordComponent, canActivate: [guestGuard] },
  
  // Rutas preparadas para tus compañeros de equipo (También deben ir protegidas):
  // { path: 'curso/css', component: CssComponent, canActivate: [authGuard] },
  // { path: 'curso/typescript', component: TypescriptComponent, canActivate: [authGuard] },

  { path: 'error/:type', component: ErrorPageComponent },
  { path: '**', component: NotFoundComponent }
];