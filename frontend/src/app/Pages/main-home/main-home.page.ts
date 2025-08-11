import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { ApiService } from 'src/app/servicios/api.service';
import { SessionService } from 'src/app/servicios/session.service';

@Component({
  selector: 'app-main-home',
  standalone: true,
  templateUrl: './main-home.page.html',
  styleUrls: ['./main-home.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule]
})
export class MainHomePage implements OnInit {
  productos: any[] = [];
  productosFiltrados: any[] = [];
  categorias: any[] = [];

  categoriaSeleccionada: number | 'all' | null = 'all';
  termino = '';

  BASE_URL = 'http://localhost:1337';
  mostrarBotones = true;
  usuario: any = null;
  rol: string | null = null;

  isLoading = false;
  errorMsg = '';

  // para skeletons
  skeletons = Array.from({ length: 8 });

  constructor(
    private api: ApiService,
    private router: Router,
    private session: SessionService
  ) {}

  ngOnInit() {
    this.verificarSesion();
  }

  ionViewWillEnter() {
    this.cargarDatos();
  }

  verificarSesion() {
    this.mostrarBotones = !this.session.estaAutenticado();
    if (!this.mostrarBotones) {
      this.usuario = this.session.obtenerUsuario();
      this.rol = this.session.obtenerRol();
    }
  }

  async cargarDatos() {
    this.isLoading = true;
    this.errorMsg = '';
    try {
      const data = await this.api.getProductos();
      this.productos = data.map(p => ({
        ...p,
        imagenUrl: p.imagen_url?.[0]?.url ? this.BASE_URL + p.imagen_url[0].url : null,
        categoria: p.categoria
      }));
      this.productosFiltrados = [...this.productos];

      this.categorias = await this.api.getCategorias();
      this.aplicarFiltros();
    } catch (error: any) {
      this.errorMsg = error?.message || 'Error al cargar productos.';
    } finally {
      this.isLoading = false;
    }
  }

  aplicarFiltros() {
    let lista = [...this.productos];

    // Filtro por categoría
    if (this.categoriaSeleccionada && this.categoriaSeleccionada !== 'all') {
      lista = lista.filter(p => p.categoria?.id === this.categoriaSeleccionada);
    }

    // Búsqueda por nombre
    const t = this.termino.trim().toLowerCase();
    if (t) {
      lista = lista.filter(p => (p.nombre || '').toLowerCase().includes(t));
    }

    this.productosFiltrados = lista;
  }

  seleccionarCategoria(catId: number | 'all') {
    this.categoriaSeleccionada = catId;
    this.aplicarFiltros();
  }

  onBuscarInput() {
    this.aplicarFiltros();
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
    //setTimeout(() => location.reload(), 100);
  }

  verDetalle(documentId: string) {
    this.router.navigate(['/productos/detalle-producto', documentId]);
  }

  crearPedido() {
    this.router.navigate(['/crear-pedido']);
  }

  formatPrecio(v: number) {
    if (v == null) return '';
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v);
  }

  trackByProd(_: number, p: any) {
    return p.documentId || p.id;
  }
}
