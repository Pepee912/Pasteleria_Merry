import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PedidosService } from 'src/app/servicios/pedidos.service';

@Component({
  selector: 'app-ver-pedidos',
  templateUrl: './ver-pedidos.page.html',
  styleUrls: ['./ver-pedidos.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class VerPedidosPage implements OnInit {
  pedidos: any[] = [];

  constructor(private pedidoService: PedidosService) {}

  async ngOnInit() {
    try {
      this.pedidos = await this.pedidoService.getPedidos();
      console.log('Pedidos cargados:', this.pedidos);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      alert('Error al cargar los pedidos: ' + error);
    }
  }
}