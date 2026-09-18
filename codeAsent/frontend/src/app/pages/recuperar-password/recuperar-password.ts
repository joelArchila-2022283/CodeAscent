import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar-password.html',
  styleUrls: ['./recuperar-password.scss']
})
export class RecuperarPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  recuperarForm: FormGroup = this.fb.group({
    correo: ['', [Validators.required, Validators.email]]
  });

  cargando = false;
  mensajeExito = '';
  mensajeError = '';

  onSubmit() {
    if (this.recuperarForm.invalid) return;

    this.cargando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    const correo = this.recuperarForm.value.correo;

    this.authService.solicitarRecuperacion(correo).subscribe({
      next: (res) => {
        this.cargando = false;
        this.mensajeExito = '¡Directiva enviada! Revisa tu bandeja de entrada (y la carpeta de SPAM).';
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = err.error?.mensaje || 'Error al conectar con los servidores de la mina.';
      }
    });
  }
}