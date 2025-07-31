import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/servicios/api.service';
import { SessionService } from 'src/app/servicios/session.service';

@Component({
  selector: 'app-main-home',
  standalone: true,
  templateUrl: './main-home.page.html',
  styleUrls: ['./main-home.page.scss'],
  imports: [CommonModule, IonicModule]
})
export class MainHomePage implements OnInit {
  productos: any[] = [];
  BASE_URL = 'http://localhost:1337';
  mostrarBotones = true;
  usuario: any = null;
  rol: string | null = null;

  categorias: any[] = [];
  categoriaSeleccionada: string | null = null;
  productosFiltrados: any[] = [];

  constructor(
    private api: ApiService,
    private router: Router,
    private session: SessionService
  ) {}

  async ngOnInit() {
    this.mostrarBotones = !this.session.estaAutenticado();

    if (!this.mostrarBotones) {
      this.usuario = this.session.obtenerUsuario();
      this.rol = this.session.obtenerRol();
    }

    try {
      const data = await this.api.getProductos();
      this.productos = data.map(p => ({
        ...p,
        imagenUrl: p.imagen_url?.[0]?.url ? this.BASE_URL + p.imagen_url[0].url : null
      }));
    } catch (error) {
      alert(error);
    }
  }

  login() {
    this.router.navigate(['/login']);
  }

  registro() {
    this.router.navigate(['/registro']);
  } 
  categoria() {
    this.router.navigate(['/ver-categorias']);
  }

  logout() {
    this.session.eliminarToken();
    localStorage.removeItem('user');
    this.mostrarBotones = true;
    this.usuario = null;
    this.rol = null;
    this.router.navigate(['/']);
    setTimeout(() => location.reload(), 100); 
  }
}
