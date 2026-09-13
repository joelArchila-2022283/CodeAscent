import { Component, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PeticionLogin } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements AfterViewInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Referencia al elemento <video #videoPlayer> 
  @ViewChild('videoPlayer') videoElement!: ElementRef<HTMLVideoElement>;

  loginForm: FormGroup = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    recordarme: [false]
  });

  cargando: boolean = false;
  mensajeError: string | null = null;

  get f() {
    return this.loginForm.controls;
  }

  ngAfterViewInit(): void {
    if (this.videoElement && this.videoElement.nativeElement) {
      const video = this.videoElement.nativeElement;
      video.muted = true; // Asegurar estado silenciado para políticas de Autoplay
      video.play().catch(error => {
        console.warn('El navegador previno la reproducción automática:', error);
      });
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = null;

    const credenciales: PeticionLogin = {
      correo: this.loginForm.value.correo,
      password: this.loginForm.value.password
    };

    this.authService.iniciarSesion(credenciales).subscribe({
      next: (respuesta) => {
        this.cargando = false;
        
        // Accedemos al token devuelto por la API
        this.authService.guardarToken(respuesta.datos.token); 
        
        this.router.navigate(['/inicio']);
      },
      error: (err) => {
        this.cargando = false;
        if (err.status === 401) {
          this.mensajeError = 'Credenciales inválidas. Verifica tu correo y contraseña.';
        } else {
          this.mensajeError = 'Fallo de lectura en la tarjeta. Inténtalo de nuevo.';
        }
      }
    });
  }
}