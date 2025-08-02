import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SessionService } from 'src/app/servicios/session.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-detalle-usuario',
  templateUrl: './detalle-usuario.page.html',
  styleUrls: ['./detalle-usuario.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule]
})
export class DetalleUsuarioPage implements OnInit {
  usuario: any;

  obtenerIniciales(nombre: string): string {
    if (!nombre) return '';
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }


  constructor(private session: SessionService) {}

  ngOnInit() {
    this.usuario = this.session.obtenerUsuario();
    //console.log('Usuario actual:', this.usuario);
  }
}
