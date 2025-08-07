import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { PedidosService } from 'src/app/servicios/pedidos.service';
import { SessionService } from 'src/app/servicios/session.service';
import { ApiService } from 'src/app/servicios/api.service';

@Component({
  selector: 'app-crear-pedido',
  templateUrl: './crear-pedido.page.html',
  styleUrls: ['./crear-pedido.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule]
})
export class CrearPedidoPage implements OnInit {
  estado = 'pendiente'; // Por defecto en pendiente
  fecha_pedido: string = new Date().toISOString();
  fecha_entrega: string = '';
  total: number | null = null;
  notas = '';
  productosSeleccionados: { productoId: string; cantidad: number }[] = []; // Lista de productos y cantidades
  productos: any[] = []; // Lista de productos para el select

  constructor(
    private pedidosService: PedidosService,
    private router: Router,
    private session: SessionService,
    private apiService: ApiService
  ) {}

  async ngOnInit() {
    try {
      this.productos = await this.apiService.getProductos();
      console.log('Productos cargados:', this.productos);
      this.calcularTotal(); // Recalcular total al cargar productos
    } catch (error) {
      console.error('Error al cargar productos:', error);
      alert('Error al cargar los productos: ' + error);
    }
  }

  onEstadoChange() {
    console.log('Estado cambiado a:', this.estado);
  }

  agregarProducto(productoId: string) {
    this.productosSeleccionados.push({ productoId, cantidad: 1 });
    this.calcularTotal(); // Recalcular total al agregar
  }

  eliminarProducto(index: number) {
    this.productosSeleccionados.splice(index, 1);
    this.calcularTotal(); // Recalcular total al eliminar
  }

  actualizarCantidad(index: number, cantidad: number) {
    if (cantidad >= 0) {
      this.productosSeleccionados[index].cantidad = cantidad;
      this.calcularTotal(); // Recalcular total al actualizar
    }
  }

  calcularTotal() {
    this.total = this.productosSeleccionados.reduce((sum, item) => {
      const producto = this.productos.find(p => p.documentId === item.productoId);
      return sum + (producto?.precio || 0) * item.cantidad;
    }, 0);
  }

  getProductoNombre(productoId: string): string {
    const producto = this.productos.find(p => p.documentId === productoId);
    return producto ? producto.nombre : 'Producto no encontrado';
  }

  getProductoPrecio(productoId: string): number {
    const producto = this.productos.find(p => p.documentId === productoId);
    return producto ? producto.precio : 0;
  }

  async crearPedido() {
    if (!this.productosSeleccionados.length || !this.fecha_pedido) {
      alert('Por favor, agrega al menos un producto y completa los campos requeridos');
      return;
    }

    const nuevoPedido = {
      estado: 'pendiente', // Forzado a pendiente por defecto
      fecha_pedido: this.fecha_pedido,
      fecha_entrega: this.fecha_entrega || null,
      total: this.total,
      notas: this.notas || '',
      users_permissions_user: this.session.obtenerUsuario()?.id || null
    };

    try {
      const response = await this.pedidosService.createPedido(nuevoPedido);
      const pedidoId = response.data.id;

      // Crear detalles para cada producto seleccionado
      for (const item of this.productosSeleccionados) {
        const nuevoDetalle = {
          subtotal: this.getProductoPrecio(item.productoId) * item.cantidad,
          cantidad: item.cantidad,
          pedido: pedidoId,
          producto: item.productoId
        };
        await this.pedidosService.createDetallePedido(nuevoDetalle);

        // Reducir inventario
        const producto = await this.apiService.getProductoByDocumentId(item.productoId);
        if (producto) {
          const nuevoStock = (producto.stock || 0) - item.cantidad;
          if (nuevoStock < 0) {
            throw new Error(`Stock insuficiente para el producto ${producto.nombre}`);
          }
          await this.apiService.updateProductoByDocumentId(item.productoId, { stock: nuevoStock });
        }
      }

      alert('Pedido e inventario actualizados exitosamente');
      this.router.navigate(['/ver-pedidos']);
    } catch (error) {
      alert('Error al crear pedido e inventario: ' + error);
    }
  }
}