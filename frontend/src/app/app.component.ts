import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { SessionService } from './servicios/session.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonicModule, RouterModule, CommonModule]
})
export class AppComponent {
  mostrarBotones = true;
  rol: string | null = null;
  usuario: any = null;

  constructor(private session: SessionService, private router: Router) {
    this.mostrarBotones = !this.session.estaAutenticado();
    if (!this.mostrarBotones) {
      this.rol = this.session.obtenerRol();
      this.usuario = this.session.obtenerUsuario();
    }
  }

  logout() {
    this.session.eliminarToken();
    localStorage.removeItem('user');
    this.mostrarBotones = true;
    this.rol = null;
    this.usuario = null;
    this.router.navigate(['/']);
    setTimeout(() => location.reload(), 100);
  }
}
