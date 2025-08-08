import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/servicios/api.service';

@Component({
  selector: 'app-detalle-pedido',
  standalone: true,
  templateUrl: './detalle-pedido.page.html',
  styleUrls: ['./detalle-pedido.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule, RouterModule]
})
export class DetallePedidoPage implements OnInit {
  pedido: any;
  nuevoEstado: string = '';

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      await this.cargarPedido(id);
    }
  }

  async cargarPedido(documentId: string) {
    try {
      const response = await this.api.getPedidoCompleto(documentId);
      this.pedido = response;
      this.nuevoEstado = this.pedido.estado;
    } catch (error) {
      console.error('Error al cargar pedido:', error);
    }
  }

  async actualizarEstado() {
    if (!this.nuevoEstado || this.nuevoEstado === this.pedido.estado) {
      alert('Selecciona un estado diferente para actualizar.');
      return;
    }

    try {
      await this.api.actualizarEstadoPedido(this.pedido.documentId, this.nuevoEstado);

      if (this.nuevoEstado === 'entregado') {
        await this.api.registrarVentaDesdePedido(this.pedido.documentId);
      }

      alert('Estado actualizado correctamente.');
      //this.router.navigate(['/ver-pedidos']);
      window.location.href = '/ver-pedidos';
    } catch (error) {
      alert('Error al actualizar el estado: ' + error);
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
