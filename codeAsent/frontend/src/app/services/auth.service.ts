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
  ) { }

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

  guardarToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  eliminarToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  estaAutenticado(): boolean {
    return this.obtenerToken() !== null;
  }

  obtenerRol(): string | null {
    const payload = this.obtenerPayloadToken();
    return payload?.rol ?? null;
  }

  /**
   * Extrae el id_usuario desde el payload del JWT actual.
   * Reutiliza el mismo mecanismo de decodificación que obtenerRol().
   */
  obtenerIdUsuario(): number | null {
    const payload = this.obtenerPayloadToken();
    return payload?.id_usuario ?? null;
  }

  private obtenerPayloadToken(): any | null {
    const token = this.obtenerToken();
    if (!token) {
      return null;
    }
    try {
      const partes = token.split('.');
      if (partes.length !== 3) {
        return null;
      }
      return JSON.parse(
        atob(partes[1].replace(/-/g, '+').replace(/_/g, '/'))
      );
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

  cerrarSesion(): void {
    this.eliminarToken();
    this.router.navigate(['/login']);
  }
}