import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private tokenKey = 'jwt';

  guardarToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  eliminarToken() {
    localStorage.removeItem(this.tokenKey);
  }

  guardarUsuario(usuario: any) {
    localStorage.setItem('user', JSON.stringify(usuario));
  }

  obtenerUsuario(): any | null {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
    
  }

  obtenerRol(): string | null {
    const u = this.obtenerUsuario();
    return u?.role?.name || null;
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }
  
}
