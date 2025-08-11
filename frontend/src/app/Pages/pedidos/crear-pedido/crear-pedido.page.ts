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

  // Recomendados / paginación
  pageSize = 12;           // cuántos mostrar por “página” de recomendados
  pageIndex = 0;           // índice de página
  mostrandoDefault = true; // indica si estamos mostrando lista por defecto

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

    // Prefill desde detalle-producto (agrega 1 unidad del producto elegido)
    await this.prefillDesdeDetalle();
  }

  ngOnDestroy(): void {
    if (this._tick) clearInterval(this._tick);
  }

  // ========= Toasts =========
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

  // ========= Entrega (mínimo y validación) =========
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

  // ========= Totales =========
  get total(): number {
    return (this.productosSeleccionados || []).reduce(
      (sum: number, p: any) => sum + (Number(p.precio) * Number(p.cantidad || 0)),
      0
    );
  }

  // ========= Carga de datos =========
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
      // Normaliza imagen y añade campo cantidad
      this.productos = data.map((p: any) => ({
        ...p,
        imagenUrl: p.imagen_url?.[0]?.url
          ? 'http://localhost:1337' + p.imagen_url[0].url
          : 'assets/logo.png',
        cantidad: 0
      }));
      // Recomendados por defecto
      this.aplicarPaginacionDefault(true);
    } catch (error) {
      await this.mostrarToast('Error al cargar productos', 'danger');
    }
  }

  // ========= Prefill desde Detalle de Producto =========
  private async prefillDesdeDetalle() {
    const docId = sessionStorage.getItem('preAddProductDocId');
    const qtyStr = sessionStorage.getItem('preAddProductQty') || '1';
    const nombre = sessionStorage.getItem('preAddProductName') || 'Producto';

    if (!docId) return;

    // Evita repetir en futuras visitas
    sessionStorage.removeItem('preAddProductDocId');
    sessionStorage.removeItem('preAddProductQty');
    sessionStorage.removeItem('preAddProductName');

    // Busca el producto por documentId (o id como fallback)
    const prod = this.productos.find(p => p.documentId === docId || String(p.id) === String(docId));
    if (!prod) return;

    // Ajusta cantidad y actualiza selección
    const qty = Math.max(1, Number(qtyStr) || 1);
    prod.cantidad = Number(prod.cantidad || 0) + qty;
    this.actualizarSeleccion(prod);

    await this.mostrarToast(`Se agregó “${nombre}” al pedido.`, 'success', 1500);
  }

  // ========= Búsqueda y filtros =========
  filtrarProductos() {
    const term = (this.terminoBusqueda || '').toLowerCase().trim();
    const hasTerm = term.length > 0;
    const hasCat = !!this.categoriaSeleccionada;

    if (!hasTerm && !hasCat) {
      // sin filtros: mostrar recomendados
      this.aplicarPaginacionDefault(true);
      return;
    }

    this.mostrandoDefault = false;

    let lista = [...this.productos];
    if (hasCat) {
      lista = lista.filter(p => p.categoria?.id === this.categoriaSeleccionada);
    }
    if (hasTerm) {
      lista = lista.filter(p => (p.nombre || '').toLowerCase().includes(term));
    }

    this.productosFiltrados = lista;
  }

  seleccionarCategoria(catId: number | null) {
    this.categoriaSeleccionada = catId;
    this.filtrarProductos();
  }

  limpiarBusqueda() {
    this.terminoBusqueda = '';
    this.filtrarProductos();
  }

  // ========= Validación de envío =========
  puedeEnviar(): boolean {
    return !!this.fechaEntrega && this.productosSeleccionados.length > 0 && !this.errorEntrega;
  }

  // ========= Manejo de cantidades / selección =========
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

  // ========= Fecha de entrega =========
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

  // ========= Envío =========
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

  // ========= Recomendados / paginación =========
  private aplicarPaginacionDefault(reset = false) {
    if (reset) this.pageIndex = 0;
    const end = (this.pageIndex + 1) * this.pageSize;
    this.productosFiltrados = this.productos.slice(0, end);
    this.mostrandoDefault = true;
  }

  verMasDefault() {
    this.pageIndex++;
    this.aplicarPaginacionDefault(false);
  }

  get hayMasDefault(): boolean {
    return this.mostrandoDefault && this.productosFiltrados.length < this.productos.length;
  }
}
