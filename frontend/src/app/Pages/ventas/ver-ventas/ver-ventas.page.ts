import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/servicios/api.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ver-ventas',
  standalone: true,
  templateUrl: './ver-ventas.page.html',
  styleUrls: ['./ver-ventas.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule, RouterModule]
})
export class VerVentasPage implements OnInit {
  ventas: any[] = [];
  ventasFiltradas: any[] = [];

  filtroMes: string = '';                 
  fechaDesde?: string;                   
  fechaHasta?: string;                   
  orden: 'recientes' | 'antiguos' = 'recientes';

  async ngOnInit() {
    try {
      const data = await this.api.getVentas();
      this.ventas = (data || []).map((v: any) => ({ ...v, _verMas: false }));
      this.aplicarFiltros();
    } catch (error) {
      alert('Error al cargar ventas: ' + error);
    }
  }

  onMesChange(ev: CustomEvent) {
    const val = (ev.detail as any).value as string | null;
    this.filtroMes = val ? val.slice(0, 7) : '';
    this.fechaDesde = undefined;
    this.fechaHasta = undefined;
    this.aplicarFiltros();
  }

  setRango(tipo: 'hoy'|'7d'|'mes'|'30d') {
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
      desde.setHours(0,0,0,0);
    }
    if (tipo === 'mes') {
      desde = new Date(now.getFullYear(), now.getMonth(), 1);
      hasta = new Date(now.getFullYear(), now.getMonth()+1, 0, 23, 59, 59);
    }
    if (tipo === '30d') {
      hasta = now;
      desde = new Date(now);
      desde.setDate(now.getDate() - 29);
      desde.setHours(0,0,0,0);
    }

    this.fechaDesde = desde.toISOString();
    this.fechaHasta =  hasta.toISOString();
    this.filtroMes = '';
    this.aplicarFiltros();
  }

  borrarRango() {
    this.fechaDesde = undefined;
    this.fechaHasta = undefined;
  }

  tieneFiltrosActivos(): boolean {
    return !!(this.filtroMes || this.fechaDesde || this.fechaHasta || this.orden === 'antiguos');
  }

  private dentroDeRango(fechaIso: string): boolean {
    if (!this.fechaDesde && !this.fechaHasta) return true;
    const t = new Date(fechaIso).getTime();
    const d = this.fechaDesde ? new Date(this.fechaDesde).getTime() : -Infinity;
    const h = this.fechaHasta  ? new Date(this.fechaHasta).getTime()  :  Infinity;
    return t >= d && t <= h;
  }

  aplicarFiltros() {
    const mes = this.filtroMes;

    let lista = this.ventas.filter(v => {
      const coincideMes = mes ? (v.fecha_venta || '').slice(0, 7) === mes : true;
      const coincideRango = this.dentroDeRango(v.fecha_venta);
      return coincideMes && coincideRango;
    });

    // ordenar por fecha_venta
    lista.sort((a, b) => new Date(a.fecha_venta).getTime() - new Date(b.fecha_venta).getTime());
    if (this.orden === 'recientes') lista = lista.reverse();

    this.ventasFiltradas = [...lista];
  }

  limpiarFiltros() {
    this.filtroMes = '';
    this.fechaDesde = undefined;
    this.fechaHasta = undefined;
    this.orden = 'recientes';
    this.aplicarFiltros();
  }

  toggleVerMas(v: any) {
    v._verMas = !v._verMas;
  }

  irADetalle(venta: any) {
    this.router.navigate(['/detalle-venta'], { queryParams: { id: venta.documentId } });
  }

  constructor(private api: ApiService, private router: Router) {}
}
