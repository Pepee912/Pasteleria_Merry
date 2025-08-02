import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/servicios/api.service';
import { SessionService } from 'src/app/servicios/session.service';
import { Router, RouterModule} from '@angular/router';
import { IonicModule } from '@ionic/angular';

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
  stock: number | null = null;
  categoriaId: number | null = null;
  categorias: any[] = [];

  constructor(private api: ApiService, private router: Router, private session: SessionService) {}

  async ngOnInit() {
    try {
      this.categorias = await this.api.getCategorias();
    } catch (error) {
      alert('Error al cargar categorías: ' + error);
    }
  }

  imagen: File | null = null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagen = file;
    }
  }

  async crearProducto() {
    if (!this.nombre || !this.precio || !this.stock || !this.categoriaId) {
      alert('Por favor, completa todos los campos');
      return;
    }

    const token = this.session.obtenerToken();
    let imagenId = null;

    // 1. Subir imagen si fue seleccionada
    if (this.imagen) {
      const formData = new FormData();
      formData.append('files', this.imagen);

      try {
        const response = await fetch('http://localhost:1337/api/upload', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        });

        const uploadData = await response.json();
        imagenId = uploadData[0].id; 
      } catch (error) {
        alert('Error al subir imagen');
        console.error(error);
        return;
      }
    }

    // 2. Crear producto con relación a la imagen
    const nuevoProducto = {
      nombre: this.nombre,
      descripcion: this.descripcion,
      precio: this.precio,
      stock: this.stock,
      categoria: this.categoriaId,
      imagen_url: imagenId ? [imagenId] : []
    };

    try {
      await this.api.createProducto(nuevoProducto);
      alert('Producto creado exitosamente');
      window.location.href = '/ver-producto';
    } catch (error) {
      alert('Error al crear producto: ' + error);
    }
  }

}
