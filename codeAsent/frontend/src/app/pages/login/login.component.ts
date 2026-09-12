import { Component, inject } from '@angular/core';
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
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

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
        
        // Accedemos a 'token' a través de 'datos'
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