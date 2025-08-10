import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/servicios/api.service';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

@Component({
  selector: 'app-ticket-pedido',
  standalone: true,
  templateUrl: './ticket-pedido.page.html',
  styleUrls: ['./ticket-pedido.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule]
})
export class TicketPedidoPage implements OnInit {
  pedido: any = null;
  cargando = true;
  qrCodeDataUrl = '';
  logoDataUrl = '';
  totalCalculado = 0;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private toast: ToastController
  ) {}

  async ngOnInit() {
    const documentId = this.route.snapshot.paramMap.get('id');
    if (!documentId) {
      this.cargando = false;
      this.notificar('No se encontró el ID del pedido.');
      return;
    }

    try {
      // 1) Traer pedido completo desde tu servicio
      this.pedido = await this.api.getPedidoCompleto(documentId);

      // 2) Calcular total (por si no viene), y generar QR
      this.totalCalculado = this.calcularTotal();
      await this.generarQR();

      // 3) Cargar logo como base64 para el PDF
      this.logoDataUrl = await this.cargarImagenComoDataURL('assets/logo.png').catch(() => '');
    } catch (e) {
      this.notificar('No se pudo cargar el pedido.');
    } finally {
      this.cargando = false;
    }
  }

  private async notificar(message: string) {
    const t = await this.toast.create({ message, duration: 2200, color: 'warning' });
    t.present();
  }

  private calcularTotal() {
    if (!this.pedido?.detalles_pedidos?.length) return 0;
    return this.pedido.detalles_pedidos.reduce(
      (acc: number, d: any) => acc + Number(d?.subtotal ?? 0),
      0
    );
  }

  async generarQR() {
    if (!this.pedido?.documentId) return;
    this.qrCodeDataUrl = await QRCode.toDataURL(this.pedido.documentId, { width: 200 });
  }

  formatearFecha(iso?: string) {
    if (!iso) return '—';
    try {
      return new Intl.DateTimeFormat('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/Mexico_City'
      }).format(new Date(iso));
    } catch {
      return new Date(iso).toLocaleString();
    }
  }

  formatearMoneda(v: number | undefined | null) {
    const n = Number(v ?? 0);
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2
    }).format(n);
  }

  async cargarImagenComoDataURL(src: string): Promise<string> {
    const res = await fetch(src);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  imprimirVista() {
    window.print();
  }

  descargarPDF() {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const marginX = 40;
    let cursorY = 50;

    const primary = { r: 183, g: 110, b: 121 };
    const softBorder = { r: 247, g: 166, b: 197 };
    const pageHeight = doc.internal.pageSize.getHeight();

    const ensureSpace = (needed = 80) => {
      if (cursorY + needed > pageHeight - 60) {
        doc.addPage();
        cursorY = 50;
      }
    };

    // Encabezado
    if (this.logoDataUrl) doc.addImage(this.logoDataUrl, 'PNG', marginX, cursorY, 56, 56);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
    doc.setTextColor(primary.r, primary.g, primary.b);
    doc.text('Pastelería Merry', marginX + 70, cursorY + 20);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
    doc.setTextColor(120, 90, 96);
    doc.text('Dulces momentos, mejor diseño', marginX + 70, cursorY + 40);
    cursorY += 70;

    // Código
    doc.setDrawColor(softBorder.r, softBorder.g, softBorder.b);
    doc.setFillColor(255, 247, 251);
    doc.roundedRect(marginX, cursorY, 515, 32, 6, 6, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.setTextColor(168, 106, 118);
    doc.text('Código:', marginX + 12, cursorY + 20);
    doc.setFont('helvetica', 'normal'); doc.setTextColor(75, 60, 64);
    doc.text(this.pedido?.documentId ?? '—', marginX + 70, cursorY + 20);
    cursorY += 48;

    // ---------- DATOS DEL PEDIDO (arreglo clave) ----------
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
    doc.setTextColor(primary.r, primary.g, primary.b);
    ensureSpace(40);
    doc.text('Datos del pedido', marginX, cursorY);
    cursorY += 10;

    const datos: Array<[string, string]> = [
      ['Cliente', this.pedido?.users_permissions_user?.username ?? '—'],
      ['Email', this.pedido?.users_permissions_user?.email ?? '—'],
      ['Estado', (this.pedido?.estado ?? '—').toString()],
      ['Creado', this.formatearFecha(this.pedido?.fecha_pedido)],
      ['Entrega', this.formatearFecha(this.pedido?.fecha_entrega)]
    ];

    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(67, 53, 58);
    const col1X = marginX;
    const col2X = marginX + 260;
    const rowH = 18;
    const baseY = cursorY;               

    datos.forEach(([k, v], i) => {
      const col = i % 2;                 
      const row = Math.floor(i / 2);     
      const y = baseY + row * rowH + 18; 
      const xKey = col === 0 ? col1X : col2X;

      ensureSpace(y - cursorY + 24);
      doc.setTextColor(168, 106, 118);
      doc.text(`${k}:`, xKey, y);
      doc.setTextColor(67, 53, 58);
      doc.text(String(v), xKey + 70, y);
    });

    // avanza Y usando el número de filas reales
    const filas = Math.ceil(datos.length / 2);
    cursorY = baseY + filas * rowH + 10;

    // Notas (ocupa ancho completo)
    if (this.pedido?.notas) {
      ensureSpace(60);
      doc.setTextColor(168, 106, 118); doc.setFont('helvetica', 'bold');
      doc.text('Notas:', marginX, cursorY + 16);
      doc.setFont('helvetica', 'normal'); doc.setTextColor(67, 53, 58);
      const notas = doc.splitTextToSize(String(this.pedido.notas), 515);
      cursorY += 32;
      doc.text(notas, marginX, cursorY);
      cursorY += notas.length * 14 + 6;
    } else {
      cursorY += 6;
    }

    // ---------- PRODUCTOS ----------
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
    doc.setTextColor(primary.r, primary.g, primary.b);
    ensureSpace(40);
    doc.text('Productos', marginX, cursorY);
    cursorY += 10;

    const tblX = marginX, tblW = 515, thH = 24;
    const qtyW = 70, nameW = 325, priceW = 120;

    doc.setDrawColor(softBorder.r, softBorder.g, softBorder.b);
    doc.setFillColor(255, 247, 251);
    doc.rect(tblX, cursorY, tblW, thH, 'FD');
    doc.setFontSize(11); doc.setTextColor(168, 106, 118);
    doc.text('Cant.', tblX + 12, cursorY + 16);
    doc.text('Producto', tblX + qtyW + 12, cursorY + 16);
    doc.text('Subtotal', tblX + qtyW + nameW + 12, cursorY + 16);
    cursorY += thH;

    doc.setTextColor(67, 53, 58); doc.setFont('helvetica', 'normal');

    const rowH2 = 22;
    (this.pedido?.detalles_pedidos ?? []).forEach((d: any) => {
      const nameLines = doc.splitTextToSize(String(d?.producto?.nombre ?? '—'), nameW - 24);
      const lines = Array.isArray(nameLines) ? nameLines.length : 1;
      const needed = Math.max(rowH2, 16 + (lines - 1) * 12) + 8;
      ensureSpace(needed);

      doc.setDrawColor(255, 229, 239);
      doc.line(tblX, cursorY, tblX + tblW, cursorY);

      doc.text(String(d?.cantidad ?? '—'), tblX + 12, cursorY + 16);
      doc.text(nameLines, tblX + qtyW + 12, cursorY + 16);
      doc.text(this.formatearMoneda(Number(d?.subtotal ?? 0)), tblX + qtyW + nameW + 12, cursorY + 16);

      cursorY += Math.max(rowH2, 16 + (lines - 1) * 12);
    });

    // Total
    const total = this.pedido?.total ?? this.totalCalculado;
    ensureSpace(48);
    doc.setDrawColor(softBorder.r, softBorder.g, softBorder.b);
    doc.setFillColor(255, 250, 252);
    doc.roundedRect(tblX, cursorY + 8, tblW, 36, 6, 6, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setTextColor(107, 75, 83);
    doc.text('Total', tblX + 12, cursorY + 32);
    doc.setTextColor(primary.r, primary.g, primary.b);
    doc.text(this.formatearMoneda(total), tblX + tblW - 12, cursorY + 32, { align: 'right' });
    cursorY += 56;

    // QR + pie
    const qrSize = 120;
    ensureSpace(qrSize + 40);
    if (this.qrCodeDataUrl) doc.addImage(this.qrCodeDataUrl, 'PNG', marginX, cursorY, qrSize, qrSize);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(120, 90, 96);
    doc.text('Escanea para validar tu pedido', marginX, cursorY + qrSize + 14);

    // Footer
    doc.setDrawColor(245, 160, 187);
    doc.line(marginX, pageHeight - 50, marginX + 515, pageHeight - 50);
    doc.setFont('helvetica', 'italic'); doc.setTextColor(168, 106, 118);
    doc.text('¡Gracias por tu compra!', marginX, pageHeight - 30);

    doc.save(`ticket_${this.pedido?.documentId ?? 'pedido'}.pdf`);
  }


}
