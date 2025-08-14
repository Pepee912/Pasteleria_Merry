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
  // ===== Catálogo y selección =====
  productos: any[] = [];
  productosFiltrados: any[] = [];
  categorias: any[] = [];
  categoriaSeleccionada: number | null = null;
  terminoBusqueda = '';
  productosSeleccionados: any[] = [];

  // ===== Entrega (nueva UX) =====
  readonly MIN_HOURS_NOTICE = 24;   // 24h de anticipación
  readonly START_HOUR = 8;          // 08:00
  readonly END_HOUR = 20;           // 20:00 (incluye 20:00)
  readonly SLOT_MINUTES = 30;       // intervalos (0,15,30,45)

  minEntregaISO = '';               // mínimos (ahora + 24h) para lógica
  selectedDate = '';                // 'YYYY-MM-DD'
  timeSlots: Array<{label: string; value: string; disabled: boolean}> = [];
  selectedTime = '';                // 'HH:mm'
  fechaEntregaISO = '';             // ISO final a enviar (cuando se confirme)
  errorEntrega = '';

  // Visual
  fechaEntregaVisual = '';
  notas = '';

  private _tick?: any;

  // ===== Recomendados / paginación =====
  pageSize = 12;
  pageIndex = 0;
  mostrandoDefault = true;

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastController
  ) {}

  async ngOnInit() {
    this.minEntregaISO = this.computeMinEntregaISO();

    // refrescar cada minuto por si el usuario deja abierta la vista
    this._tick = setInterval(() => {
      this.minEntregaISO = this.computeMinEntregaISO();
      // si hay fecha seleccionada, regeneramos la disponibilidad
      if (this.selectedDate) {
        this.generateTimeSlotsFor(this.selectedDate);
        this.validateSelection();
      }
    }, 60_000);

    await this.cargarCategorias();
    await this.cargarProductos();
    await this.prefillDesdeDetalle();
  }

  ngOnDestroy(): void {
    if (this._tick) clearInterval(this._tick);
  }

  // ===================== Toast =====================
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

  // ===================== Helpers de fecha =====================
  private pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }

  // Mínimo permitido: ahora + 24h (ISO)
  private computeMinEntregaISO(): string {
    const t = new Date(Date.now() + this.MIN_HOURS_NOTICE * 60 * 60 * 1000);
    return t.toISOString();
  }

  // Construye ISO local a partir de 'YYYY-MM-DD' y 'HH:mm'
  private buildIsoLocal(dateStr: string, timeStr: string): string {
    // Usamos hora local del navegador/cliente
    const [y, m, d] = dateStr.split('-').map(Number);
    const [hh, mm] = timeStr.split(':').map(Number);
    const dt = new Date(y, (m - 1), d, hh, mm, 0, 0);
    return dt.toISOString();
  }

  // Checa si (dateStr + timeStr) es >= minEntrega y dentro de 08–20 (incluye 20:00 exacto)
  private isSlotValid(dateStr: string, timeStr: string): boolean {
    // Ventana 08–20
    const [hh, mm] = timeStr.split(':').map(Number);
    const afterStart = (hh > this.START_HOUR) || (hh === this.START_HOUR && mm >= 0);
    const beforeEnd  = (hh < this.END_HOUR)  || (hh === this.END_HOUR  && mm === 0);
    if (!(afterStart && beforeEnd)) return false;

    // Mínimo 24h
    const slotISO = this.buildIsoLocal(dateStr, timeStr);
    return new Date(slotISO).getTime() >= new Date(this.minEntregaISO).getTime();
  }

  // Genera slots de 15 min entre 08:00 y 20:00 para la fecha dada
  private generateTimeSlotsFor(dateStr: string) {
    const slots: Array<{label: string; value: string; disabled: boolean}> = [];
    for (let h = this.START_HOUR; h <= this.END_HOUR; h++) {
      for (let m = 0; m < 60; m += this.SLOT_MINUTES) {
        // Permitimos exactamente 20:00, pero no 20:15/20:30/20:45
        if (h === this.END_HOUR && m > 0) break;

        const hh = this.pad(h);
        const mm = this.pad(m);
        const value = `${hh}:${mm}`;
        const label = `${hh}:${mm}`;
        const disabled = !this.isSlotValid(dateStr, value);
        slots.push({ label, value, disabled });
      }
    }
    this.timeSlots = slots;

    // Si el slot seleccionado quedó inválido al regenerar, lo limpiamos
    if (this.selectedTime) {
      const exists = this.timeSlots.find(s => s.value === this.selectedTime && !s.disabled);
      if (!exists) {
        this.selectedTime = '';
      }
    }
  }

  // Validar selección actual y preparar visual/ISO final
  private validateSelection() {
    this.errorEntrega = '';

    if (!this.selectedDate) {
      this.fechaEntregaISO = '';
      this.fechaEntregaVisual = '';
      this.errorEntrega = 'Selecciona una fecha de entrega.';
      return;
    }

    if (!this.selectedTime) {
      this.fechaEntregaISO = '';
      this.fechaEntregaVisual = '';
      this.errorEntrega = 'Selecciona un horario de entrega.';
      return;
    }

    if (!this.isSlotValid(this.selectedDate, this.selectedTime)) {
      this.fechaEntregaISO = '';
      this.fechaEntregaVisual = '';
      this.errorEntrega = 'El horario seleccionado no está disponible.';
      return;
    }

    // OK
    this.fechaEntregaISO = this.buildIsoLocal(this.selectedDate, this.selectedTime);
    const fecha = new Date(this.fechaEntregaISO);
    const opcionesFecha: Intl.DateTimeFormatOptions = {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    };
    const opcionesHora: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    this.fechaEntregaVisual =
      `${fecha.toLocaleDateString('es-MX', opcionesFecha)} ${fecha.toLocaleTimeString('es-MX', opcionesHora)}`;
  }

  // ===================== Handlers UI (fecha/slot) =====================
  onDateChange(ev: any) {
    const iso = ev?.detail?.value as string;
    if (!iso) {
      this.selectedDate = '';
      this.timeSlots = [];
      this.selectedTime = '';
      this.validateSelection();
      return;
    }

    // Convertimos ISO -> 'YYYY-MM-DD' local
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = this.pad(d.getMonth() + 1);
    const day = this.pad(d.getDate());
    this.selectedDate = `${y}-${m}-${day}`;

    this.generateTimeSlotsFor(this.selectedDate);
    this.validateSelection();
  }

  onPickSlot(slot: {label: string; value: string; disabled: boolean}) {
    if (slot.disabled) {
      this.mostrarToast('Ese horario no está disponible para esa fecha.', 'info', 1600);
      return;
    }
    this.selectedTime = slot.value;
    this.validateSelection();
  }

  // ===================== Totales =====================
  get total(): number {
    return (this.productosSeleccionados || []).reduce(
      (sum: number, p: any) => sum + (Number(p.precio) * Number(p.cantidad || 0)),
      0
    );
  }

  // ===================== Carga de datos =====================
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
      this.aplicarPaginacionDefault(true);
    } catch (error) {
      await this.mostrarToast('Error al cargar productos', 'danger');
    }
  }

  // ===================== Prefill desde detalle =====================
  private async prefillDesdeDetalle() {
    const docId = sessionStorage.getItem('preAddProductDocId');
    const qtyStr = sessionStorage.getItem('preAddProductQty') || '1';
    const nombre = sessionStorage.getItem('preAddProductName') || 'Producto';

    if (!docId) return;

    sessionStorage.removeItem('preAddProductDocId');
    sessionStorage.removeItem('preAddProductQty');
    sessionStorage.removeItem('preAddProductName');

    const prod = this.productos.find(p => p.documentId === docId || String(p.id) === String(docId));
    if (!prod) return;

    const qty = Math.max(1, Number(qtyStr) || 1);
    prod.cantidad = Number(prod.cantidad || 0) + qty;
    this.actualizarSeleccion(prod);

    await this.mostrarToast(`Se agregó “${nombre}” al pedido.`, 'success', 1500);
  }

  // ===================== Búsqueda y filtros =====================
  filtrarProductos() {
    const term = (this.terminoBusqueda || '').toLowerCase().trim();
    const hasTerm = term.length > 0;
    const hasCat = !!this.categoriaSeleccionada;

    if (!hasTerm && !hasCat) {
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

  // ===================== Selección / cantidades =====================
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

  // ===================== Envío =====================
  puedeEnviar(): boolean {
    return !!this.fechaEntregaISO && this.productosSeleccionados.length > 0 && !this.errorEntrega;
  }

  async crearPedido() {
    // validación final
    this.validateSelection();
    if (this.errorEntrega || !this.fechaEntregaISO) {
      await this.mostrarToast(this.errorEntrega || 'Selecciona una fecha y horario de entrega.', 'danger');
      return;
    }

    try {
      const usuario = this.api['session'].obtenerUsuario();

      const pedidoData = {
        estado: 'pendiente',
        fecha_pedido: new Date().toISOString(),
        fecha_entrega: this.fechaEntregaISO, // <-- ISO final
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

  // ===================== Paginación recomendados =====================
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

  // Devuelve true si EXISTEN slots para el día seleccionado y TODOS están deshabilitados
  allSlotsDisabled(): boolean {
    return Array.isArray(this.timeSlots) &&
          this.timeSlots.length > 0 &&
          this.timeSlots.every(s => s.disabled);
  }

  // Retorna true si el día tiene al menos 1 slot válido
  isDayEnabled = (dateIso: string): boolean => {
    if (!dateIso) return false;

    const d = new Date(dateIso);
    const y = d.getFullYear();
    const m = this.pad(d.getMonth() + 1);
    const day = this.pad(d.getDate());
    const dateStr = `${y}-${m}-${day}`;

    // Revisar todos los posibles slots del día
    for (let h = this.START_HOUR; h <= this.END_HOUR; h++) {
      for (let mm = 0; mm < 60; mm += this.SLOT_MINUTES) {
        if (h === this.END_HOUR && mm > 0) break; // Solo 20:00 exacto
        const timeStr = `${this.pad(h)}:${this.pad(mm)}`;
        if (this.isSlotValid(dateStr, timeStr)) {
          return true; // Encontramos al menos un horario válido
        }
      }
    }
    return false; // Ningún horario válido → día deshabilitado
  };


}
