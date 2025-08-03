import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { SessionService } from '../servicios/session.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private session: SessionService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
  const rolesPermitidos: string[] = route.data['roles'];
  const rolUsuario = this.session.obtenerRol();

  if (rolUsuario && rolesPermitidos.includes(rolUsuario)) {
    return true;
  } else {
    this.router.navigate(['/login']); 
    return false;
    
  }
}
}
