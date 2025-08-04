import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/servicios/api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ver-ventas',
  standalone: true,
  templateUrl: './ver-ventas.page.html',
  styleUrls: ['./ver-ventas.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule]
})
export class VerVentasPage implements OnInit {
  ventas: any[] = [];
  ventasFiltradas: any[] = [];
  fechaFiltro: string = '';

  constructor(private api: ApiService, private router: Router) {}

  async ngOnInit() {
    try {
      this.ventas = await this.api.getVentas();
      this.ventasFiltradas = [...this.ventas];
    } catch (error) {
      alert('Error al cargar ventas: ' + error);
    }
  }

  filtrarVentas() {
    if (!this.fechaFiltro) {
      this.ventasFiltradas = [...this.ventas];
      return;
    }

    this.ventasFiltradas = this.ventas.filter(venta => {
      const fechaVenta = new Date(venta.fecha_venta).toISOString().split('T')[0];
      return fechaVenta === this.fechaFiltro;
    });
  }

  irADetalle(venta: any) {
    this.router.navigate(['/detalle-venta'], { queryParams: { id: venta.documentId } });
  }
}
