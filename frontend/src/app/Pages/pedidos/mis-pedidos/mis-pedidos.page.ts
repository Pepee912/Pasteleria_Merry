import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/servicios/api.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  templateUrl: './mis-pedidos.page.html',
  styleUrls: ['./mis-pedidos.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule, RouterModule]
})
export class MisPedidosPage implements OnInit {
  pedidos: any[] = [];
  pedidosFiltrados: any[] = [];

  // Filtros
  estadoSeleccionado: 'todos' | 'pendiente' | 'aceptado' | 'rechazado' | 'entregado' = 'todos';
  textoBusqueda = '';
  fechaDesde?: string; 
  fechaHasta?: string; 
  orden: 'recientes' | 'antiguos' = 'recientes';

  constructor(private api: ApiService) {}

  async ngOnInit() {
    await this.cargarMisPedidos();
  }

  async doRefresh(ev: CustomEvent) {
    await this.cargarMisPedidos();
    (ev.target as HTMLIonRefresherElement).complete();
  }

  async cargarMisPedidos() {
    try {
      this.pedidos = await this.api.getMisPedidos(); 
      this.aplicarFiltros();
    } catch (error) {
      alert(error);
    }
  }

  aplicarFiltros() {
    const q = this.textoBusqueda.trim().toLowerCase();
    const dDesde = this.fechaDesde ? new Date(this.fechaDesde) : null;
    const dHasta = this.fechaHasta ? new Date(this.fechaHasta) : null;

    const dentroRango = (iso: string) => {
      const d = new Date(iso);
      if (dDesde && d < dDesde) return false;
      if (dHasta) {
        const h = new Date(dHasta); h.setHours(23,59,59,999);
        if (d > h) return false;
      }
      return true;
    };

    this.pedidosFiltrados = (this.pedidos || [])
      .filter(p => this.estadoSeleccionado === 'todos' ? true : p.estado === this.estadoSeleccionado)
      .filter(p => dentroRango(p.fecha_pedido))
      .filter(p => {
        if (!q) return true;
        const code = (p.documentId || '').toLowerCase();
        const productos = (p.detalles_pedidos || [])
          .map((d: any) => (d.producto?.nombre || '').toLowerCase())
          .join(' ');
        return code.includes(q) || productos.includes(q);
      })
      .sort((a, b) => {
        const diff = new Date(b.fecha_pedido).getTime() - new Date(a.fecha_pedido).getTime();
        return this.orden === 'recientes' ? diff : -diff;
      });
  }

  tieneFiltrosActivos(): boolean {
    return this.estadoSeleccionado !== 'todos'
      || !!this.textoBusqueda
      || !!this.fechaDesde
      || !!this.fechaHasta
      || this.orden !== 'recientes';
  }

  limpiarFiltros() {
    this.estadoSeleccionado = 'todos';
    this.textoBusqueda = '';
    this.fechaDesde = undefined;
    this.fechaHasta = undefined;
    this.orden = 'recientes';
    this.aplicarFiltros();
  }

  toggleVerMas(pedido: any) {
    pedido._verMas = !pedido._verMas;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  async cancelarPedido(documentId: string) {
    if (!confirm('¿Estás seguro de cancelar este pedido?')) return;
    try {
      await this.api.cancelarPedidoByDocumentId(documentId);
      alert('Pedido cancelado correctamente');
      await this.cargarMisPedidos();
    } catch (error) {
      alert('No se pudo cancelar el pedido: ' + error);
    }
  }
}
