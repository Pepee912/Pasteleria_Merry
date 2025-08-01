import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from 'src/app/servicios/api.service';

@Component({
  selector: 'app-ver-producto',
  standalone: true,
  templateUrl: './ver-producto.page.html',
  styleUrls: ['./ver-producto.page.scss'],
  imports: [CommonModule, IonicModule, RouterModule]
})
export class VerProductoPage implements OnInit {
  productos: any[] = [];
  BASE_URL = 'http://localhost:1337';

  constructor(private api: ApiService, private router: Router) {}

  async ngOnInit() {
    await this.cargarProductos();
  }

  async cargarProductos() {
    try {
      const data = await this.api.getProductos();
      console.log('Productos obtenidos desde la API:', data);

      this.productos = data.map(p => ({
        ...p,
        imagenUrl: p.imagen_url?.[0]?.url
          ? this.BASE_URL + p.imagen_url[0].url
          : 'assets/logo.png'
      }));
    } catch (error) {
      alert(error);
    }
  }

  irACrearProducto() {
    this.router.navigate(['/crear-producto']);
  }

  irAEditarProducto(productoId: number) {
    this.router.navigate(['/editar-producto'], {
      queryParams: { id: productoId }
    });
  }

  async eliminarProducto(documentId: string) {
    const confirmar = confirm('¿Estás seguro de eliminar este producto?');
    if (!confirmar) return;

    //console.log('Intentando eliminar producto con documentId:', documentId);

    try {
      await this.api.deleteProductoByDocumentId(documentId);
      this.productos = this.productos.filter(p => p.documentId !== documentId);
      console.log('Producto eliminado correctamente');
    } catch (error) {
      alert('Error al eliminar producto: ' + error);
    }
  }



}
