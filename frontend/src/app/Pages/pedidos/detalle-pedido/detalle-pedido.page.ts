import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/servicios/api.service';

type Estado = 'pendiente' | 'aceptado' | 'entregado' | 'cancelado';
type OpcionEstado = { value: 'aceptado'|'entregado'|'cancelado', label: string };

const TRANSICIONES: Record<Estado, OpcionEstado[]> = {
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
  nuevoEstado = ''; // seleccionado en el UI
  cargando = false;
  actualizando = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
      private toast: ToastController,
      private alertCtrl: AlertController
  ) {}

  // --- helpers UI ---
  private async showToast(message: string, opts: Partial<Parameters<ToastController['create']>[0]> = {}) {
    const t = await this.toast.create({
      message,
      duration: 2000,
      position: 'top',
      cssClass: 'toast-clarito',
      ...opts
    });
    await t.present();
  }

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) await this.cargarPedido(id);
  }

  get opcionesEstado(): OpcionEstado[] {
    const estado: Estado = (this.pedido?.estado ?? 'pendiente') as Estado;
    return TRANSICIONES[estado] ?? [];
  }

  get transicionesHabilitadas(): boolean {
    return this.opcionesEstado.length > 0;
  }

  async cargarPedido(documentId: string) {
    try {
      this.cargando = true;
      const response = await this.api.getPedidoCompleto(documentId);
      this.pedido = response;
      this.nuevoEstado = '';
    } catch (error) {
      console.error('Error al cargar pedido:', error);
      await this.showToast('No se pudo cargar el pedido');
      this.router.navigate(['/ver-pedidos']);
    } finally {
      this.cargando = false;
    }
  }

  async actualizarEstado() {
    if (!this.pedido) return;

    // 1) Releer el estado actual del servidor para evitar condiciones de carrera
    const ultimo = await this.api.getPedidoCompleto(this.pedido.documentId);
    if (ultimo.estado !== this.pedido.estado) {
      this.pedido = ultimo;
      this.nuevoEstado = '';
      await this.showToast(`El pedido cambió a "${ultimo.estado}". Vuelve a seleccionar la acción.`);
      return;
    }

    // 2) Validar que la transición seleccionada es permitida
    const permitidos = this.opcionesEstado.map(o => o.value);
    if (!this.nuevoEstado || !permitidos.includes(this.nuevoEstado as any)) {
      await this.showToast('Selecciona una opción válida para el estado actual');
      return;
    }

    // 3) Confirmación con Ion Alert (pastel)
    const verb = this.opcionesEstado.find(o => o.value === this.nuevoEstado)?.label ?? 'Continuar';
    const alert = await this.alertCtrl.create({
      header: 'Confirmar',
      message: `¿Deseas "${verb}" este pedido?`,
      cssClass: 'alert-pastel',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: verb,
          role: this.nuevoEstado === 'cancelado' ? 'destructive' : 'confirm',
          handler: async () => { await this._aplicarTransicion(); }
        }
      ]
    });
    await alert.present();
  }

  private async _aplicarTransicion() {
    try {
      this.actualizando = true;

      // 4) Actualizar
      await this.api.actualizarEstadoPedido(this.pedido.documentId, this.nuevoEstado as any);

      // 5) Lógica de venta: solo al pasar a ENTREGADO
      if (this.nuevoEstado === 'entregado') {
        await this.api.registrarVentaDesdePedido(this.pedido.documentId);
      }

      await this.showToast('Estado actualizado');
      this.router.navigate(['/ver-pedidos']);
    } catch (error) {
      await this.showToast('Error al actualizar el estado');
    } finally {
      this.actualizando = false;
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }
}
