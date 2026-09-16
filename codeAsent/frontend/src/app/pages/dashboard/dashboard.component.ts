import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; 
import { AuthService } from '../../services/auth.service';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardData } from '../../interfaces/usuario.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);

  cargando = signal<boolean>(true);
  errorCarga = signal<string | null>(null);
  datosDashboard = signal<DashboardData | null>(null);

  ngOnInit(): void {
    this.cargarInformacion();
  }

  cargarInformacion(): void {
    this.cargando.set(true);
    this.dashboardService.obtenerDatosDashboard().subscribe({
      next: (data) => {
        this.datosDashboard.set(data);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar dashboard:', err);
        this.errorCarga.set('No se pudo conectar con el servidor.');
        this.cargando.set(false);
      }
    });
  }

  irAlMapa(): void {
    this.router.navigate(['/mapa']);
  }

  cerrarSesion(): void {
    if (this.authService && typeof this.authService.eliminarToken === 'function') {
      this.authService.eliminarToken();
    } else {
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }
}