import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidosService } from 'src/app/servicios/pedidos.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-detalle-pedido',
  templateUrl: './detalle-pedido.page.html',
  styleUrls: ['./detalle-pedido.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class DetallePedidoPage implements OnInit {
  pedido: any = null;
  estados = ['pendiente', 'aceptado', 'entregado', 'cancelado'];

  constructor(
    private route: ActivatedRoute,
    private pedidosService: PedidosService,
    private router: Router
  ) {}

  async ngOnInit() {
    const pedidoId = this.route.snapshot.paramMap.get('id');
    if (pedidoId) {
      try {
        const pedidos = await this.pedidosService.getPedidos();
        this.pedido = pedidos.find((p: any) => p.id === pedidoId);
        console.log('Pedido detallado:', this.pedido);
      } catch (error) {
        console.error('Error al cargar el pedido:', error);
        alert('Error al cargar el pedido: ' + error);
      }
    }
  }

  async actualizarEstado(nuevoEstado: string) {
    if (this.pedido && this.pedido.id) {
      try {
        const data = { estado: nuevoEstado };
        await this.pedidosService.updatePedidoByDocumentId(this.pedido.documentId || this.pedido.id, data);
        this.pedido.estado = nuevoEstado;
        alert(`Estado actualizado a ${nuevoEstado} exitosamente`);
      } catch (error) {
        console.error('Error al actualizar el estado:', error);
        alert('Error al actualizar el estado: ' + error);
      }
    }
  }
}