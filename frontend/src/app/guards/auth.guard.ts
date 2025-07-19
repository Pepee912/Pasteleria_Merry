import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SessionService } from '../servicios/session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private session: SessionService, private router: Router) { }

  canActivate(): boolean {
    if (this.session.obtenerRol() === 'Authenticated') {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
