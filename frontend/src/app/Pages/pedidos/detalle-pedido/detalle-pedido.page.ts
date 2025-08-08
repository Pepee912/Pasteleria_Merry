import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/servicios/api.service';

type OpcionEstado = { value: 'aceptado'|'entregado'|'cancelado', label: string };

const TRANSICIONES: Record<string, OpcionEstado[]> = {
  pendiente: [
    { value: 'aceptado', label: 'Aceptar' },
    { value: 'cancelado', label: 'Cancelar' },
  ],
  aceptado: [
    { value: 'entregado', label: 'Entregar' },
    { value: 'cancelado', label: 'Cancelar' },
  ],
  entregado: [],
  cancelado: [],
};

@Component({
  selector: 'app-detalle-pedido',
  standalone: true,
  templateUrl: './detalle-pedido.page.html',
  styleUrls: ['./detalle-pedido.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule, RouterModule]
})
export class DetallePedidoPage implements OnInit {
  pedido: any;
  nuevoEstado = ''; 

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) {}

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) await this.cargarPedido(id);
  }

  get opcionesEstado(): OpcionEstado[] {
    const estado = this.pedido?.estado ?? '';
    return TRANSICIONES[estado] ?? [];
  }

  get transicionesHabilitadas(): boolean {
    return this.opcionesEstado.length > 0;
  }

  async cargarPedido(documentId: string) {
    try {
      const response = await this.api.getPedidoCompleto(documentId);
      this.pedido = response;
      this.nuevoEstado = ''; 
    } catch (error) {
      console.error('Error al cargar pedido:', error);
    }
  }

  async actualizarEstado() {
    if (!this.pedido) return;

    // 1) Releer el estado actual del servidor para evitar condiciones de carrera
    const ultimo = await this.api.getPedidoCompleto(this.pedido.documentId);
    if (ultimo.estado !== this.pedido.estado) {
      this.pedido = ultimo;
      this.nuevoEstado = '';
      alert(`El pedido cambió a "${ultimo.estado}". Vuelve a seleccionar la acción.`);
      return;
    }

    // 2) Validar que la transición seleccionada es permitida
    const permitidos = this.opcionesEstado.map(o => o.value);
    if (!this.nuevoEstado || !permitidos.includes(this.nuevoEstado as any)) {
      alert('Selecciona una opción válida para el estado actual.');
      return;
    }

    try {
      // 3) Actualizar
      await this.api.actualizarEstadoPedido(this.pedido.documentId, this.nuevoEstado);

      // 4) Lógica de venta: solo al pasar a ENTREGADO (desde aceptado)
      if (this.nuevoEstado === 'entregado') {
        await this.api.registrarVentaDesdePedido(this.pedido.documentId);
      }

      alert('Estado actualizado correctamente.');
      window.location.href = '/ver-pedidos';
    } catch (error) {
      alert('Error al actualizar el estado: ' + error);
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }
}
