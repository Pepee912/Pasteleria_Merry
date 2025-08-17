// src/app/pages/productos/ver-producto/ver-producto.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
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
  cargando = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastController,
    private alertCtrl: AlertController
  ) {}

  private async showToast(message: string, opts: Partial<Parameters<ToastController['create']>[0]> = {}) {
    const t = await this.toast.create({
      message,
      duration: 2000,
      position: 'top',
      cssClass: 'toast-clarito',
      ...opts
    });
    await t.present();
  }

  async ngOnInit() {
    await this.cargarCategorias();
    await this.cargarProductos();
  }

  async cargarCategorias() {
    try {
      this.categorias = await this.api.getCategorias();
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      await this.showToast('No se pudieron cargar las categorías');
    }
  }

  async cargarProductos() {
    try {
      this.cargando = true;
      const data = await this.api.getProductos();
      this.productos = data.map((p: any) => ({
        ...p,
        imagenUrl: p.imagen_url?.[0]?.url
          ? this.BASE_URL + p.imagen_url[0].url
          : 'assets/logo.png'
      }));
      this.productosFiltrados = [...this.productos];
    } catch (error: any) {
      console.error(error);
      await this.showToast('Error al cargar productos');
    } finally {
      this.cargando = false;
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
    this.router.navigate(['/editar-producto', documentId]);
  }

  async eliminarProducto(documentId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar producto',
      message: '¿Estás seguro? Esta acción es permanente.',
      cssClass: 'alert-pastel',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.api.deleteProductoByDocumentId(documentId);
              this.productos = this.productos.filter(p => p.documentId !== documentId);
              this.productosFiltrados = this.productosFiltrados.filter(p => p.documentId !== documentId);
              await this.showToast('Producto eliminado');
            } catch (error: any) {
              console.error('Error al eliminar producto:', error);
              await this.showToast('Error al eliminar producto');
            }
          }
        }
      ]
    });
    await alert.present();
  }
}
