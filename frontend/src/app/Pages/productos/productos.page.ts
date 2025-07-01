import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/servicios/api.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.page.html',
  styleUrls: ['./productos.page.scss'],
  standalone: false
})

export class ProductosPage implements OnInit {
  productos: any[] = [];
  private readonly BASE_URL = 'http://localhost:1337';

  constructor(private api: ApiService) {}

  async ngOnInit() {
    try {
      const rawProductos = await this.api.getProductos();
      console.log('Productos obtenidos:', rawProductos);

      this.productos = rawProductos.map(p => ({
        ...p,
        imagenUrl: p.imagen_url?.[0]?.url ? this.BASE_URL + p.imagen_url[0].url : null
      }));
    } catch (err) {
      console.error('Error al cargar productos:', err);
      alert('Error al cargar productos: ' + err);
    }
  }
}

