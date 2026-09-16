import { Component, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PeticionLogin } from '../../interfaces/auth.interface';

declare const google: any;

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

  @ViewChild('videoPlayer') videoElement!: ElementRef<HTMLVideoElement>;

  mostrarPassword: boolean = false;
  private googleIniciado: boolean = false;

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
      video.muted = true;
      video.play().catch(error => {
        console.warn('Autoplay bloqueado:', error);
      });
    }

    setTimeout(() => {
      this.inicializarGoogleSignIn();
    }, 150);
  }

  inicializarGoogleSignIn(): void {
    if (typeof google !== 'undefined' && google.accounts && !this.googleIniciado) {
      google.accounts.id.initialize({
        client_id: '266374154159-abde0sbplau30dh97arskl4gqut0dns0.apps.googleusercontent.com',
        callback: (response: any) => this.handleGoogleResponse(response)
      });
      
      this.googleIniciado = true;

      const googleBtnContainer = document.getElementById('googleBtn');
      if (googleBtnContainer) {
        const anchoContenedor = googleBtnContainer.clientWidth || 350;

        google.accounts.id.renderButton(
          googleBtnContainer,
          { 
            theme: 'filled_black', 
            size: 'large', 
            type: 'standard', 
            shape: 'pill', 
            text: 'signin_with',
            width: anchoContenedor
          }
        );
      }
    }
  }

  handleGoogleResponse(response: any): void {
    const idToken = response.credential;
    this.cargando = true;
    this.mensajeError = null;

    this.authService.loginConGoogle(idToken).subscribe({
      next: (respuesta) => {
        this.cargando = false;
        this.authService.guardarToken(respuesta.datos.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = err.error?.mensaje || 'Error al autenticar con Google. Inténtalo de nuevo.';
      }
    });
  }

  toggleMostrarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  irARegistro(): void {
    this.router.navigate(['/registro']);
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
        this.authService.guardarToken(respuesta.datos.token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.cargando = false;
        if (err.status === 401) {
          this.mensajeError = 'Credenciales inválidas. Verifica tu correo y contraseña.';
        } else {
          this.mensajeError = 'Fallo de conexión. Inténtalo de nuevo.';
        }
      }
    });
  }
}