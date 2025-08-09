import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';

import { ApiService } from 'src/app/servicios/api.service';

@Component({
  selector: 'app-crear-pedido',
  standalone: true,
  templateUrl: './crear-pedido.page.html',
  styleUrls: ['./crear-pedido.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class CrearPedidoPage implements OnInit {
  productos: any[] = [];
  productosFiltrados: any[] = [];
  categorias: any[] = [];
  categoriaSeleccionada: number | null = null;
  terminoBusqueda: string = '';
  fechaEntrega: string = '';
  fechaEntregaVisual: string = '';
  notas: string = '';
  hoy: string = new Date().toISOString().split('T')[0]; 
  productosSeleccionados: any[] = [];

  constructor(private api: ApiService, private router: Router) {}

  async ngOnInit() {
    await this.cargarCategorias();
    await this.cargarProductos();
  }

  async cargarCategorias() {
    try {
      this.categorias = await this.api.getCategorias();
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }

  async cargarProductos() {
    try {
      const data = await this.api.getProductos();
      this.productos = data.map(p => ({
        ...p,
        imagenUrl: p.imagen_url?.[0]?.url
          ? 'http://localhost:1337' + p.imagen_url[0].url
          : 'assets/logo.png',
        cantidad: 0
      }));

      this.productosFiltrados = [...this.productos];
    } catch (error) {
      alert('Error al cargar productos: ' + error);
    }
  }

  filtrarProductos() {
    const termino = this.terminoBusqueda.toLowerCase().trim();

    if (!termino) {
      this.productosFiltrados = [];
      return;
    }

    this.productosFiltrados = this.productos.filter(p =>
      p.nombre.toLowerCase().includes(termino)
    );
  }

  puedeEnviar(): boolean {
    return (
      !!this.fechaEntrega &&
      this.productosSeleccionados.length > 0
    );
  }

  actualizarSeleccion(producto: any) {
    const index = this.productosSeleccionados.findIndex(p => p.documentId === producto.documentId);

    if (producto.cantidad > 0) {
      if (index === -1) {
        this.productosSeleccionados.push({
          ...producto
        });
      } else {
        this.productosSeleccionados[index].cantidad = producto.cantidad;
      }
    } else {
      if (index !== -1) {
        this.productosSeleccionados.splice(index, 1);
      }
    }
  }

  async crearPedido() {
    try {
      const usuario = this.api['session'].obtenerUsuario();

      // Calcular el total basado en los productos seleccionados
      const total = this.productosSeleccionados.reduce(
        (sum, p) => sum + (p.precio * p.cantidad),
        0
      );

      const pedidoData = {
        estado: 'pendiente',
        fecha_pedido: new Date().toISOString(),
        fecha_entrega: this.fechaEntrega,
        total,
        notas: this.notas,
        users_permissions_user: usuario.id
      };

      const detalles = this.productosSeleccionados.map(p => ({
        cantidad: p.cantidad,
        subtotal: p.cantidad * p.precio,
        producto: p.id
      }));

      await this.api.generarPedido(pedidoData, detalles);

      alert('Pedido creado con éxito.');
      window.location.href = '/mis-pedidos';
    } catch (error) {
      console.error('Error al generar el pedido:', error);
      alert('Hubo un problema al generar el pedido');
    }
  }

  onFechaEntregaChange(event: any) {
  this.fechaEntrega = event.detail.value;
  const fecha = new Date(this.fechaEntrega);

  // Formatear manualmente la fecha y hora
  const opcionesFecha: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  const opcionesHora: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit'
  };

  const fechaStr = fecha.toLocaleDateString('es-MX', opcionesFecha);
  const horaStr = fecha.toLocaleTimeString('es-MX', opcionesHora);

  this.fechaEntregaVisual = `${fechaStr} ${horaStr}`;
}



}