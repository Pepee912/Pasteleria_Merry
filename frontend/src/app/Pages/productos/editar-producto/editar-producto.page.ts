// src/app/pages/productos/editar-producto/editar-producto.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/servicios/api.service';
import { SessionService } from 'src/app/servicios/session.service';
import { IonicModule, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-editar-producto',
  standalone: true,
  templateUrl: './editar-producto.page.html',
  styleUrls: ['./editar-producto.page.scss'],
  imports: [CommonModule, IonicModule, RouterModule, FormsModule]
})
export class EditarProductoPage implements OnInit {
  documentId = '';
  productoId: number | null = null;
  nombre = '';
  descripcion = '';
  precio: number | null = null;
  categoriaId: number | null = null;
  categorias: any[] = [];

  imagen: File | null = null;
  imagenUrl: string | null = null;

  cargando = false;
  guardando = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private session: SessionService,
    private router: Router,
    private toast: ToastController
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
    this.documentId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.documentId) {
      await this.showToast('Falta documentId');
      this.router.navigate(['/ver-producto']);
      return;
    }

    try {
      this.cargando = true;
      this.categorias = await this.api.getCategorias();
      const producto = await this.api.getProductoByDocumentId(this.documentId);
      this.productoId = producto.id;
      this.nombre = producto.nombre;
      this.descripcion = producto.descripcion;
      this.precio = producto.precio;
      this.categoriaId = producto.categoria?.id ?? null;
      this.imagenUrl = producto.imagenUrl ?? null;
    } catch (err) {
      await this.showToast('Error al cargar producto');
      this.router.navigate(['/ver-producto']);
    } finally {
      this.cargando = false;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) this.imagen = file;
  }

  async actualizarProducto() {
    if (!this.productoId || !this.nombre.trim() || !this.descripcion.trim() || this.precio === null || this.categoriaId === null) {
      await this.showToast('Todos los campos son obligatorios');
      return;
    }

    const token = this.session.obtenerToken();
    let imagenId: number | null = null;

    if (this.imagen) {
      const formData = new FormData();
      formData.append('files', this.imagen);
      try {
        const res = await fetch('http://localhost:1337/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        const uploadData = await res.json();
        imagenId = uploadData?.[0]?.id ?? null;
      } catch {
        await this.showToast('Error al subir imagen');
        return;
      }
    }

    const datos: any = {
      nombre: this.nombre.trim(),
      descripcion: this.descripcion.trim(),
      precio: this.precio,
      categoria: this.categoriaId
    };
    if (imagenId) datos.imagen_url = [imagenId];

    try {
      this.guardando = true;
      await this.api.updateProductoByDocumentId(this.documentId, datos);
      await this.showToast('Producto actualizado');
      //this.router.navigate(['/ver-producto']);
      window.location.href = '/ver-producto';
    } catch (error: any) {
      await this.showToast('Error al actualizar producto');
    } finally {
      this.guardando = false;
    }
  }
}
