// editar-producto.page.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/servicios/api.service';
import { SessionService } from 'src/app/servicios/session.service';
import { IonicModule } from '@ionic/angular';

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
  stock: number | null = null;
  categoriaId: number | null = null;
  categorias: any[] = [];

  imagen: File | null = null;
  imagenUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private session: SessionService,
    private router: Router
  ) {}

  async ngOnInit() {
    //this.documentId = this.route.snapshot.queryParamMap.get('documentId') || '';
    this.documentId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.documentId) return alert('Falta documentId');

    this.categorias = await this.api.getCategorias();

    try {
      const producto = await this.api.getProductoByDocumentId(this.documentId);
      this.productoId = producto.id;
      this.nombre = producto.nombre;
      this.descripcion = producto.descripcion;
      this.precio = producto.precio;
      this.stock = producto.stock;
      this.categoriaId = producto.categoria?.id ?? null;
      this.imagenUrl = producto.imagenUrl ?? null;
    } catch (err) {
      alert('Error al cargar producto');
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagen = file;
    }
  }

  async actualizarProducto() {
    //console.log('productoId:', this.productoId);
    //console.log('nombre:', this.nombre);
    //console.log('descripcion:', this.descripcion);
    //console.log('precio:', this.precio);
    //console.log('stock:', this.stock);
    //console.log('categoriaId:', this.categoriaId);

    if (
      !this.productoId ||
      this.nombre.trim() === '' ||
      this.descripcion.trim() === '' ||
      this.precio === null ||
      this.stock === null ||
      this.categoriaId === null
    ) {
      alert('Todos los campos son obligatorios');
      return;
    }

    const token = this.session.obtenerToken();
    let imagenId = null;

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
        imagenId = uploadData[0].id;
      } catch (error) {
        alert('Error al subir imagen');
        return;
      }
    }

    const datos = {
      nombre: this.nombre,
      descripcion: this.descripcion,
      precio: this.precio,
      stock: this.stock,
      categoria: this.categoriaId,
      ...(imagenId ? { imagen_url: [imagenId] } : {})
    };

    try {
      await this.api.updateProductoByDocumentId(this.documentId, datos);
      alert('Producto actualizado');
      //this.router.navigate(['/ver-producto']);
      window.location.href = '/ver-producto';
    } catch (error) {
      alert('Error al actualizar producto: ' + error);
    }
  }
}
