import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router'; 
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

  constructor(private session: SessionService) {
    this.mostrarBotones = !this.session.estaAutenticado();

    if (!this.mostrarBotones) {
      this.rol = this.session.obtenerRol();
    }
  }
  
}
