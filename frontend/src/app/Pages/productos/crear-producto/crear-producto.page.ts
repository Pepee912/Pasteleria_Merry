// src/app/pages/productos/crear-producto/crear-producto.page.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/servicios/api.service';
import { SessionService } from 'src/app/servicios/session.service';
import { Router, RouterModule } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-crear-producto',
  templateUrl: './crear-producto.page.html',
  styleUrls: ['./crear-producto.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule]
})
export class CrearProductoPage implements OnInit {
  nombre = '';
  descripcion = '';
  precio: number | null = null;
  categoriaId: number | null = null;
  categorias: any[] = [];

  imagen: File | null = null;
  creando = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private session: SessionService,
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
    try {
      this.categorias = await this.api.getCategorias();
    } catch (error) {
      await this.showToast('Error al cargar categorías');
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) this.imagen = file;
  }

  async crearProducto() {
    if (!this.nombre.trim() || !this.precio || !this.categoriaId) {
      await this.showToast('Completa los campos requeridos');
      return;
    }

    const token = this.session.obtenerToken();
    let imagenId: number | null = null;

    // 1) Subir imagen (opcional)
    if (this.imagen) {
      const formData = new FormData();
      formData.append('files', this.imagen);
      try {
        const response = await fetch('http://localhost:1337/api/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        const uploadData = await response.json();
        imagenId = uploadData?.[0]?.id ?? null;
      } catch (error) {
        console.error(error);
        await this.showToast('Error al subir imagen');
        return;
      }
    }

    // 2) Crear producto
    const nuevoProducto: any = {
      nombre: this.nombre.trim(),
      descripcion: this.descripcion.trim(),
      precio: this.precio,
      categoria: this.categoriaId,
      imagen_url: imagenId ? [imagenId] : []
    };

    try {
      this.creando = true;
      await this.api.createProducto(nuevoProducto);
      await this.showToast('Producto creado');
      //this.router.navigate(['/ver-producto']);
      window.location.href = '/ver-producto';
    } catch (error: any) {
      console.error(error);
      await this.showToast('Error al crear producto');
    } finally {
      this.creando = false;
    }
  }
}
