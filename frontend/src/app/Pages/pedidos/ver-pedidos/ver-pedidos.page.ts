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

  filtroMes: string = '';
  filtroEstado: string = '';

  constructor(private api: ApiService, private router: Router) {}

  async ngOnInit() {
    try {
      const response = await this.api.getPedidosAdmin();
      this.pedidos = response.sort((a: any, b: any) =>
        new Date(a.fecha_entrega).getTime() - new Date(b.fecha_entrega).getTime()
      );
      this.pedidosFiltrados = [...this.pedidos];
    } catch (error) {
      alert('Error al cargar pedidos');
    }
  }

  aplicarFiltros() {
    const estado = this.filtroEstado.toLowerCase();
    const mes = this.filtroMes;

    this.pedidosFiltrados = this.pedidos.filter(p => {
      const coincideEstado = estado ? p.estado === estado : true;
      const coincideMes = mes ? p.fecha_pedido?.startsWith(mes) : true;
      return coincideEstado && coincideMes;
    });
  }

  verDetalle(documentId: string) {
    this.router.navigate(['/detalle-pedido', documentId]);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
