import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from 'src/app/servicios/api.service';

@Component({
  selector: 'app-crear-pedido',
  standalone: true,
  templateUrl: './crear-pedido.page.html',
  styleUrls: ['./crear-pedido.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class CrearPedidoPage implements OnInit, OnDestroy {
  productos: any[] = [];
  productosFiltrados: any[] = [];
  categorias: any[] = [];
  categoriaSeleccionada: number | null = null;
  terminoBusqueda = '';
  fechaEntrega = '';
  fechaEntregaVisual = '';
  notas = '';
  hoy: string = new Date().toISOString().split('T')[0];
  productosSeleccionados: any[] = [];

  // Validación de entrega 
  readonly MIN_HOURS_NOTICE = 24;   
  minEntrega: string = '';          
  errorEntrega: string = '';        
  private _tick?: any;             

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastController
  ) {}

  async ngOnInit() {
    this.minEntrega = this.computeMinEntregaIso(this.MIN_HOURS_NOTICE);

    this._tick = setInterval(() => {
      this.minEntrega = this.computeMinEntregaIso(this.MIN_HOURS_NOTICE);
      if (this.fechaEntrega) {
        this.errorEntrega = this.validarVentanaEntrega(this.fechaEntrega);
      }
    }, 60_000);

    await this.cargarCategorias();
    await this.cargarProductos();
  }

  ngOnDestroy(): void {
    if (this._tick) clearInterval(this._tick);
  }

  private async mostrarToast(
    message: string,
    tipo: 'success' | 'danger' | 'info' = 'info',
    duration = 2200
  ) {
    const cssClassMap = {
      success: 'toast-pastel-success',
      danger: 'toast-pastel-danger',
      info: 'toast-pastel-info'
    } as const;

    const t = await this.toast.create({
      message,
      duration,
      position: 'top',
      cssClass: cssClassMap[tipo]
    });
    await t.present();
  }

  private computeMinEntregaIso(hoursAhead: number): string {
    const t = new Date(Date.now() + hoursAhead * 60 * 60 * 1000);
    return t.toISOString();
  }

  private validarVentanaEntrega(fechaIso: string): string {
    if (!fechaIso) return 'Selecciona una fecha y hora de entrega.';
    const entrega = new Date(fechaIso).getTime();
    const limite = new Date(this.minEntrega).getTime();

    if (isNaN(entrega)) return 'La fecha de entrega no es válida.';
    if (entrega < limite) {
      return `La entrega debe programarse con al menos ${this.MIN_HOURS_NOTICE} horas de anticipación.`;
    }
    return '';
  }

  // ===== Totales =====
  get total(): number {
    return (this.productosSeleccionados || []).reduce(
      (sum: number, p: any) => sum + (Number(p.precio) * Number(p.cantidad || 0)),
      0
    );
  }

  // ===== Carga de datos =====
  async cargarCategorias() {
    try {
      this.categorias = await this.api.getCategorias();
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }

  async cargarProductos() {
    try {
      const data = await this.api.getProductos();
      this.productos = data.map((p: any) => ({
        ...p,
        imagenUrl: p.imagen_url?.[0]?.url
          ? 'http://localhost:1337' + p.imagen_url[0].url
          : 'assets/logo.png',
        cantidad: 0
      }));
      this.productosFiltrados = [];
    } catch (error) {
      await this.mostrarToast('Error al cargar productos', 'danger');
    }
  }

  // ===== Búsqueda =====
  filtrarProductos() {
    const termino = (this.terminoBusqueda || '').toLowerCase().trim();

    if (!termino) {
      this.productosFiltrados = [];
      return;
    }

    this.productosFiltrados = this.productos.filter(p =>
      (p.nombre || '').toLowerCase().includes(termino)
    );

    if (termino && this.productosFiltrados.length === 0) {
      this.mostrarToast('No encontramos productos con ese nombre.', 'info', 1800);
    }
  }

  // ===== Validación de envío =====
  puedeEnviar(): boolean {
    return !!this.fechaEntrega && this.productosSeleccionados.length > 0 && !this.errorEntrega;
  }

  // ===== Manejo de cantidades =====
  actualizarSeleccion(producto: any) {
    const index = this.productosSeleccionados.findIndex(p => p.documentId === producto.documentId);
    const qty = Number(producto.cantidad) || 0;

    if (qty > 0) {
      if (index === -1) {
        this.productosSeleccionados.push({ ...producto, cantidad: qty });
      } else {
        this.productosSeleccionados[index].cantidad = qty;
      }
    } else if (index !== -1) {
      this.productosSeleccionados.splice(index, 1);
    }
  }

  incCantidad(producto: any) {
    producto.cantidad = Number(producto.cantidad || 0) + 1;
    this.actualizarSeleccion(producto);
  }

  decCantidad(producto: any) {
    const next = Number(producto.cantidad || 0) - 1;
    producto.cantidad = next > 0 ? next : 0;
    this.actualizarSeleccion(producto);
  }

  // ===== Fecha de entrega =====
  onFechaEntregaChange(event: any) {
    this.fechaEntrega = event?.detail?.value || '';
    this.errorEntrega = this.validarVentanaEntrega(this.fechaEntrega);

    if (!this.fechaEntrega) {
      this.fechaEntregaVisual = '';
      return;
    }

    const fecha = new Date(this.fechaEntrega);
    const opcionesFecha: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const opcionesHora: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit'
    };
    const fechaStr = fecha.toLocaleDateString('es-MX', opcionesFecha);
    const horaStr = fecha.toLocaleTimeString('es-MX', opcionesHora);
    this.fechaEntregaVisual = `${fechaStr} ${horaStr}`;
  }

  // ===== Envío =====
  async crearPedido() {
    this.errorEntrega = this.validarVentanaEntrega(this.fechaEntrega);
    if (this.errorEntrega) {
      await this.mostrarToast(this.errorEntrega, 'danger');
      return;
    }

    try {
      const usuario = this.api['session'].obtenerUsuario();

      const pedidoData = {
        estado: 'pendiente',
        fecha_pedido: new Date().toISOString(),
        fecha_entrega: this.fechaEntrega,
        total: this.total,
        notas: this.notas,
        users_permissions_user: usuario.id
      };

      const detalles = this.productosSeleccionados.map(p => ({
        cantidad: p.cantidad,
        subtotal: p.cantidad * p.precio,
        producto: p.id
      }));

      await this.api.generarPedido(pedidoData, detalles);

      await this.mostrarToast('Pedido creado con éxito.', 'success');
      window.location.href = '/mis-pedidos';
    } catch (error) {
      console.error('Error al generar el pedido:', error);
      await this.mostrarToast('Hubo un problema al generar el pedido', 'danger');
    }
  }
}
