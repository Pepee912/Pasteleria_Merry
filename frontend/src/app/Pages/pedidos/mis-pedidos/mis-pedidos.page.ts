import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/servicios/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  templateUrl: './mis-pedidos.page.html',
  styleUrls: ['./mis-pedidos.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule]
})
export class MisPedidosPage implements OnInit {
  pedidos: any[] = [];
  BASE_URL = 'http://localhost:1337';

  constructor(private api: ApiService) {}

  async ngOnInit() {
    await this.cargarMisPedidos();
  }

  async cargarMisPedidos() {
    try {
      this.pedidos = await this.api.getMisPedidos();
      console.log('Pedidos:', this.pedidos);
    } catch (error) {
      alert(error);
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  async cancelarPedido(documentId: string) {
    const confirmar = confirm('¿Estás seguro de cancelar este pedido?');
    if (!confirmar) return;

    try {
      await this.api.cancelarPedidoByDocumentId(documentId);
      alert('Pedido cancelado correctamente');
      await this.cargarMisPedidos(); 
    } catch (error) {
      alert('No se pudo cancelar el pedido: ' + error);
    }
  }

}
