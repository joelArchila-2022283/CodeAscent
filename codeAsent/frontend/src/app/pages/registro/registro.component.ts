import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

declare const google: any;

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent implements AfterViewInit {
  
  @ViewChild('videoPlayer') videoElement!: ElementRef<HTMLVideoElement>;

  registroForm: FormGroup;
  cargando = false;
  mensajeError = '';
  mostrarPassword = false;
  private googleIniciado: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      usuario: ['', [Validators.required, Validators.minLength(3)]],
      correo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      terminos: [false, [Validators.requiredTrue]]
    });
  }

  ngAfterViewInit(): void {
    if (this.videoElement && this.videoElement.nativeElement) {
      const video = this.videoElement.nativeElement;
      video.muted = true;
      video.play().catch(error => {
        console.warn('Autoplay bloqueado por el navegador:', error);
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

      const googleBtnContainer = document.getElementById('googleBtnRegister');
      if (googleBtnContainer) {
        const anchoContenedor = googleBtnContainer.clientWidth || 350;

        google.accounts.id.renderButton(
          googleBtnContainer,
          { 
            theme: 'filled_black', 
            size: 'large', 
            type: 'standard', 
            shape: 'pill', 
            text: 'signup_with', 
            width: anchoContenedor // Se pasa como número
          }
        );
      }
    }
  }

  handleGoogleResponse(response: any): void {
    const idToken = response.credential;
    this.cargando = true;
    this.mensajeError = '';

    this.authService.loginConGoogle(idToken).subscribe({
      next: (respuesta) => {
        this.cargando = false;
        this.authService.guardarToken(respuesta.datos.token);
        this.router.navigate(['/inicio']);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        this.mensajeError = err.error?.mensaje || 'Error al autenticar con Google.';
      }
    });
  }

  toggleMostrarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  onSubmit(): void {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    this.cargando = true;
    this.mensajeError = '';
    
    const formValues = this.registroForm.value;

    const payload = {
      nombre: formValues.usuario,
      correo: formValues.correo,
      password: formValues.password,
      rol: 'jugador'
    };

    this.authService.registrar(payload).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        this.cargando = false;
        this.mensajeError = err.error?.mensaje || 'Error al crear la cuenta.';
      }
    });
  }
}