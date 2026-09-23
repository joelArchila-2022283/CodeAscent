import { Routes } from '@angular/router';

// Componentes de Autenticación y Principales
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { RecuperarPasswordComponent } from './pages/recuperar-password/recuperar-password';
import { RestaurarPasswordComponent } from './pages/restaurar-password/restaurar-password';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
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
import { authGuard, guestGuard } from './core/guards/auth-guard';
import { comicAccessGuard } from './core/guards/comic-access.guard';

// Rutas de comics
import { ComicComponent } from './pages/comics/comic_1/comic.component';
import { ComicComponent2 } from './pages/comics/comic_2/comic.component';
import { ComicComponent3 } from './pages/comics/comic_3/comic.component';
import { ComicComponent4 } from './pages/comics/comic_4/comic.component';
import { ComicComponent5 } from './pages/comics/comic_5/comic.component';
import { ComicComponent6 } from './pages/comics/comic_6/comic.component';
import { ComicComponent7 } from './pages/comics/comic_7/comic.component';
import { ComicComponent8 } from './pages/comics/comic_8/comic.component';
import { ComicComponent9 } from './pages/comics/comic_9/comic.component';
import { ComicComponent10 } from './pages/comics/comic_10/comic.component';

//Ruta de galeria de comics
import { GaleriaComponent } from './pages/galeria/galeria.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  //Ruta Galeria
  {
    path: 'galeria',
    component: GaleriaComponent,
    canActivate: [authGuard]
  },

  //Rutas comics

  {
    path: 'comic/1',
    component: ComicComponent,
    canActivate: [authGuard, comicAccessGuard]
  },
  {
    path: 'comic/2',
    component: ComicComponent2,
    canActivate: [authGuard, comicAccessGuard]
  },
  {
    path: 'comic/3',
    component: ComicComponent3,
    canActivate: [authGuard, comicAccessGuard]
  },
  {
    path: 'comic/4',
    component: ComicComponent4,
    canActivate: [authGuard, comicAccessGuard]
  },
  {
    path: 'comic/5',
    component: ComicComponent5,
    canActivate: [authGuard, comicAccessGuard]
  },
  {
    path: 'comic/6',
    component: ComicComponent6,
    canActivate: [authGuard, comicAccessGuard]
  },
  {
    path: 'comic/7',
    component: ComicComponent7,
    canActivate: [authGuard, comicAccessGuard]
  },
  {
    path: 'comic/8',
    component: ComicComponent8,
    canActivate: [authGuard, comicAccessGuard]
  },
  {
    path: 'comic/9',
    component: ComicComponent9,
    canActivate: [authGuard, comicAccessGuard]
  },
  {
    path: 'comic/10',
    component: ComicComponent10,
    canActivate: [authGuard, comicAccessGuard]
  },

  // ==========================================
  // RUTAS PÚBLICAS (Protegidas con guestGuard)
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
  // ==========================================
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    component: PerfilComponent,
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [authGuard]
  },
  {
    path: 'mapa',
    component: MapaComponent,
    canActivate: [authGuard]
  },

  // ==========================================
  // VISTAS DE CURSOS Y DASHBOARDS POR LENGUAJE (Desde el Mapa)
  // ==========================================
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
    path: 'html',
    redirectTo: 'curso/html',
    pathMatch: 'full'
  },
  {
    path: 'css',
    redirectTo: 'curso/css',
    pathMatch: 'full'
  },
  {
    path: 'sql',
    redirectTo: 'curso/sql',
    pathMatch: 'full'
  },
  {
    path: 'typescript',
    redirectTo: 'curso/typescript',
    pathMatch: 'full'
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
