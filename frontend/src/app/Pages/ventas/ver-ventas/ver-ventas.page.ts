import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/servicios/api.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { calendarOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

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
  fechaFiltro: string = '';
  estadoFiltro: string = '';

  constructor(private api: ApiService, private router: Router) {
    addIcons({
      'calendar-outline': calendarOutline
    });
  }

  async ngOnInit() {
    try {
      this.ventas = await this.api.getVentas();
      this.ventasFiltradas = [...this.ventas];
    } catch (error) {
      alert('Error al cargar ventas: ' + error);
    }
  }

  filtrarVentas() {
    const fecha = this.fechaFiltro?.toLowerCase() || '';
    const estado = this.estadoFiltro?.toLowerCase() || '';

    this.ventasFiltradas = this.ventas.filter(venta => {
      const fechaVenta = new Date(venta.fecha_venta).toISOString().split('T')[0];
      const estadoPedido = venta.pedido?.estado?.toLowerCase() || '';

      const coincideFecha = fecha ? fechaVenta.includes(fecha) : true;
      const coincideEstado = estado ? estadoPedido === estado : true;

      return coincideFecha && coincideEstado;
    });
  }

  irADetalle(venta: any) {
    this.router.navigate(['/detalle-venta'], { queryParams: { id: venta.documentId } });
  }
}
