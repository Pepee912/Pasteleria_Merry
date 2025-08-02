// src/app/pages/productos/ver-producto/ver-producto.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from 'src/app/servicios/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ver-producto',
  standalone: true,
  templateUrl: './ver-producto.page.html',
  styleUrls: ['./ver-producto.page.scss'],
  imports: [CommonModule, IonicModule, RouterModule, FormsModule]
})
export class VerProductoPage implements OnInit {
  productos: any[] = [];
  productosFiltrados: any[] = [];
  categorias: any[] = [];
  categoriaSeleccionada: string | null = null;
  BASE_URL = 'http://localhost:1337';

  constructor(private api: ApiService, private router: Router) {}

  async ngOnInit() {
    await this.cargarCategorias();
    await this.cargarProductos();
  }

  async cargarCategorias() {
    try {
      this.categorias = await this.api.getCategorias();
    } catch (error) {
      console.error('Error al obtener categorías:', error);
    }
  }

  async cargarProductos() {
    try {
      const data = await this.api.getProductos();
      this.productos = data.map(p => ({
        ...p,
        imagenUrl: p.imagen_url?.[0]?.url
          ? this.BASE_URL + p.imagen_url[0].url
          : 'assets/logo.png'
      }));
      this.productosFiltrados = [...this.productos];
    } catch (error) {
      alert(error);
    }
  }

  filtrarPorCategoria() {
    if (!this.categoriaSeleccionada) {
      this.productosFiltrados = [...this.productos];
      return;
    }

    const categoriaId = parseInt(this.categoriaSeleccionada + '', 10);
    this.productosFiltrados = this.productos.filter(p => p.categoria?.id === categoriaId);
  }

  irACrearProducto() {
    this.router.navigate(['/crear-producto']);
  }

  irAEditarProducto(documentId: string) {
    this.router.navigate(['/editar-producto'], {
      queryParams: { documentId }
    });
  }

  async eliminarProducto(documentId: string) {
    const confirmar = confirm('¿Estás seguro de eliminar este producto?');
    if (!confirmar) return;

    try {
      await this.api.deleteProductoByDocumentId(documentId);
      this.productos = this.productos.filter(p => p.documentId !== documentId);
      this.productosFiltrados = this.productosFiltrados.filter(p => p.documentId !== documentId);
      console.log('Producto eliminado correctamente');
    } catch (error) {
      alert('Error al eliminar producto: ' + error);
    }
  }
}
