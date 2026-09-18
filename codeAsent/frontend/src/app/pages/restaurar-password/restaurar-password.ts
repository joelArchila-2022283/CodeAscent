import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-restaurar-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './restaurar-password.html',
  styleUrls: ['./restaurar-password.scss']
})
export class RestaurarPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  restaurarForm: FormGroup;
  token: string = '';
  cargando = false;
  mensajeExito = '';
  mensajeError = '';
  mostrarPassword = false;

  constructor() {
    this.restaurarForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', [Validators.required]]
    }, { validators: this.passwordsCoinciden });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.mensajeError = 'Enlace inválido o corrupto. Por favor, solicita uno nuevo.';
      }
    });
  }

  passwordsCoinciden(form: FormGroup) {
    const pass = form.get('password')?.value;
    const confirm = form.get('confirmarPassword')?.value;
    return pass === confirm ? null : { noCoinciden: true };
  }

  toggleMostrarPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  onSubmit() {
    if (this.restaurarForm.invalid || !this.token) return;

    this.cargando = true;
    this.mensajeError = '';
    const nuevaPassword = this.restaurarForm.value.password;

    this.authService.restaurarPasswordSegura(this.token, nuevaPassword).subscribe({
      next: () => {
        this.cargando = false;
        this.mensajeExito = '¡Núcleo calibrado exitosamente! Redirigiendo al Altar de Acceso...';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.cargando = false;
        this.mensajeError = err.error?.mensaje || 'El enlace ha caducado o es inválido.';
      }
    });
  }
}