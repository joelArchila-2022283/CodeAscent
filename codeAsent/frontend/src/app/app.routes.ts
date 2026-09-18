import { Routes } from '@angular/router';

// Componentes de Autenticación y Principales
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { RecuperarPasswordComponent } from './pages/recuperar-password/recuperar-password.component';
import { RestaurarPasswordComponent } from './pages/restaurar-password/restaurar-password.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { MapaComponent } from './pages/mapa/mapa.component';

// Componentes de Cursos y Módulos
import { HtmlDashboardComponent } from './pages/html/html-dashboard/html-dashboard.component';
import { CssDashboardComponent } from './pages/css/css-dashboard/css-dashboard.component';
import { SqlComponent } from './pages/sql/sql.component';
import { TSDashboardComponent } from './pages/TS/TS-dashboard/TS-dashboard.component';

// Páginas de Sistema y Errores
import { NotFoundComponent } from './not-found/not-found.component';
import { ErrorPageComponent } from './error-page/error-page.component';

// Guardianes de Autenticación
import { authGuard, guestGuard } from './core/guards/auth.guard'; 

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // ==========================================
  // RUTAS PÚBLICas (Protegidas con guestGuard)
  // Si ya tienes sesión o "Recordarme", te redirigen al dashboard
  // ==========================================
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'registro',
    component: RegistroComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'recuperar-password',
    component: RecuperarPasswordComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'restaurar-password',
    component: RestaurarPasswordComponent,
    canActivate: [guestGuard]
  },

  {
    path: 'inicio',
    redirectTo: 'mapa',
    pathMatch: 'full'
  },

  // ==========================================
  // RUTAS PRIVADAS (Protegidas con authGuard)
  // Exigen token activo para poder ingresar
  // ==========================================
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'mapa',
    component: MapaComponent,
    canActivate: [authGuard]
  },
  {
    path: 'curso/html',
    component: HtmlDashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'curso/css',
    component: CssDashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'sql',
    component: SqlComponent,
    canActivate: [authGuard]
  },
  {
    path: 'curso/sql',
    component: SqlComponent,
    canActivate: [authGuard]
  },
  {
    path: 'curso/typescript',
    component: TSDashboardComponent,
    canActivate: [authGuard]
  },

  // ==========================================
  // RUTAS DE ERROR Y COMODINES
  // ==========================================
  {
    path: 'error/:type',
    component: ErrorPageComponent
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];