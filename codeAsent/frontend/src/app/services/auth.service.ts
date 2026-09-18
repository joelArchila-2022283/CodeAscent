import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  PeticionLogin,
  RespuestaAuth
} from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'token';
  private readonly API_URL = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  iniciarSesion(
    credenciales: PeticionLogin
  ): Observable<RespuestaAuth> {
    return this.http.post<RespuestaAuth>(
      `${this.API_URL}/usuarios/login`,
      credenciales
    );
  }

  registrar(datosUsuario: any): Observable<any> {
    return this.http.post<any>(
      `${this.API_URL}/usuarios`,
      datosUsuario
    );
  }

  // Actualizado para aceptar un booleano 'recordar'
  guardarToken(token: string, recordar: boolean = true): void {
    if (recordar) {
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  // Busca en localStorage primero, luego en sessionStorage
  obtenerToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  // Limpia ambos almacenes
  eliminarToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
  }

  estaAutenticado(): boolean {
    return this.obtenerToken() !== null;
  }

  obtenerRol(): string | null {
    const token = this.obtenerToken();
    if (!token) {
      return null;
    }
    try {
      const partes = token.split('.');
      if (partes.length !== 3) {
        return null;
      }
      const payload = JSON.parse(
        atob(partes[1].replace(/-/g, '+').replace(/_/g, '/'))
      );
      return payload.rol ?? null;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }

  loginConGoogle(idToken: string): Observable<RespuestaAuth> {
    return this.http.post<RespuestaAuth>(
      `${this.API_URL}/usuarios/google`,
      { idToken }
    );
  }

  solicitarRecuperacion(correo: string): Observable<any> {
    return this.http.post<any>(
      `${this.API_URL}/usuarios/recuperar`,
      { correo }
    );
  }

  restaurarPasswordSegura(token: string, nuevaPassword: string): Observable<any> {
    return this.http.post<any>(
      `${this.API_URL}/usuarios/actualizar-password`,
      { token, nuevaPassword }
    );
  }

  cerrarSesion(): void {
    this.eliminarToken();
    this.router.navigate(['/login']);
  }
}