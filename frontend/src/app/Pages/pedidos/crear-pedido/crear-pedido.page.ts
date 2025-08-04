import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { PedidosService } from 'src/app/servicios/pedidos.service';
import { SessionService } from 'src/app/servicios/session.service';

@Component({
  selector: 'app-crear-pedido',
  templateUrl: './crear-pedido.page.html',
  styleUrls: ['./crear-pedido.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule]
})
export class CrearPedidoPage implements OnInit {
  estado = 'pendiente'; // Default state
  fecha_pedido: string = new Date().toISOString();
  fecha_entrega: string = '';
  total: number | null = null;
  notas = '';

  constructor(
    private pedidoService: PedidosService,
    private router: Router,
    private session: SessionService
  ) {}

  async ngOnInit() {
    console.log('Estado inicial:', this.estado); // Log initial value
  }

  onEstadoChange() {
    console.log('Estado cambiado a:', this.estado);
  }

  async crearPedido() {
  if (!this.total || !this.estado || !this.fecha_pedido) {
    alert('Por favor, completa los campos requeridos: estado, fecha pedido y total');
    return;
  }

  const validEstados = ['pendiente', 'aceptado', 'entregado', 'cancelado'];
  if (!validEstados.includes(this.estado.toLowerCase())) {
    alert('Estado inválido. Debe ser: pendiente, aceptado, entregado o cancelado');
    return;
  }

  console.log('Estado enviado:', this.estado);
  console.log('ID del usuario:', this.session.obtenerUsuario()?.id); // Agrega esta línea

  const nuevoPedido = {
    estado: this.estado,
    fecha_pedido: this.fecha_pedido,
    fecha_entrega: this.fecha_entrega || null,
    total: this.total,
    notas: this.notas || '',
    users_permissions_user: this.session.obtenerUsuario()?.id || null
  };

  try {
    const response = await this.pedidoService.createPedido(nuevoPedido);
    alert('Pedido creado exitosamente');
    this.router.navigate(['/ver-pedidos']);
  } catch (error) {
    alert('Error al crear pedido: ' + error);
    console.error('Detalles del error:', error);
  }
}
}