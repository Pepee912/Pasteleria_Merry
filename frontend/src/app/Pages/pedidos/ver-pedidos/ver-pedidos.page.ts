import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/servicios/api.service';

@Component({
  selector: 'app-ver-pedidos',
  standalone: true,
  templateUrl: './ver-pedidos.page.html',
  styleUrls: ['./ver-pedidos.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule, RouterModule]
})
export class VerPedidosPage implements OnInit {
  pedidos: any[] = [];
  pedidosFiltrados: any[] = [];

  // filtros
  filtroEstado: string = '';                 // '', 'pendiente', 'aceptado', 'rechazado', 'entregado'
  filtroMes: string = '';                    // 'YYYY-MM'
  fechaDesde?: string;                       // ISO string
  fechaHasta?: string;                       // ISO string
  orden: 'recientes' | 'antiguos' = 'recientes';

  constructor(private api: ApiService, private router: Router) {}

  async ngOnInit() {
    try {
      const response = await this.api.getPedidosAdmin();
      this.pedidos = response;
      this.aplicarFiltros();
    } catch (error) {
      alert('Error al cargar pedidos');
    }
  }

  onMesChange(ev: CustomEvent) {
    const val = (ev.detail as any).value as string | null;
    this.filtroMes = val ? val.slice(0, 7) : '';
    // al elegir un mes, limpiamos rango manual
    this.fechaDesde = undefined;
    this.fechaHasta = undefined;
    this.aplicarFiltros();
  }

  setRango(tipo: 'hoy' | '7d' | 'mes' | '30d') {
    const now = new Date();
    let desde = new Date();
    let hasta = new Date();

    if (tipo === 'hoy') {
      desde = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      hasta = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    }
    if (tipo === '7d') {
      hasta = now;
      desde = new Date(now);
      desde.setDate(now.getDate() - 6);
      desde.setHours(0, 0, 0, 0);
    }
    if (tipo === 'mes') {
      desde = new Date(now.getFullYear(), now.getMonth(), 1);
      hasta = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    }
    if (tipo === '30d') {
      hasta = now;
      desde = new Date(now);
      desde.setDate(now.getDate() - 29);
      desde.setHours(0, 0, 0, 0);
    }

    this.fechaDesde = desde.toISOString();
    this.fechaHasta  = hasta.toISOString();
    // al elegir rango, limpiamos mes
    this.filtroMes = '';
    this.aplicarFiltros();
  }

  borrarRango() {
    this.fechaDesde = undefined;
    this.fechaHasta = undefined;
  }

  tieneFiltrosActivos(): boolean {
    return !!(this.filtroEstado || this.filtroMes || this.fechaDesde || this.fechaHasta || this.orden === 'antiguos');
  }

  private dentroDeRango(fechaIso: string): boolean {
    if (!this.fechaDesde && !this.fechaHasta) return true;
    const t = new Date(fechaIso).getTime();
    const d = this.fechaDesde ? new Date(this.fechaDesde).getTime() : -Infinity;
    const h = this.fechaHasta  ? new Date(this.fechaHasta).getTime()  :  Infinity;
    return t >= d && t <= h;
  }

  aplicarFiltros() {
    const estado = (this.filtroEstado || '').toLowerCase();
    const mes = this.filtroMes;

    // 1) filtrar
    let lista = this.pedidos.filter(p => {
      const coincideEstado = estado ? p.estado === estado : true;
      const coincideMes = mes ? (p.fecha_pedido || '').slice(0, 7) === mes : true;
      const coincideRango = this.dentroDeRango(p.fecha_pedido);
      return coincideEstado && coincideMes && coincideRango;
    });

    // 2) ordenar
    lista.sort((a: any, b: any) =>
      new Date(a.fecha_pedido).getTime() - new Date(b.fecha_pedido).getTime()
    );
    if (this.orden === 'recientes') {
      lista = lista.reverse();
    }

    this.pedidosFiltrados = [...lista];
  }

  limpiarFiltros() {
    this.filtroEstado = '';
    this.filtroMes = '';
    this.fechaDesde = undefined;
    this.fechaHasta = undefined;
    this.orden = 'recientes';
    this.aplicarFiltros();
  }

  verDetalle(documentId: string) {
    this.router.navigate(['/detalle-pedido', documentId]);
  }
}
