import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { ApiService } from 'src/app/servicios/api.service';
import { SessionService } from 'src/app/servicios/session.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-detalle-producto',
  templateUrl: './detalle-producto.page.html',
  styleUrls: ['./detalle-producto.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class DetalleProductoPage implements OnInit {
  BASE_URL = 'http://localhost:1337';

  producto: any = null;
  imagenes: string[] = [];
  imagenPrincipal: string | null = null;

  isLoading = true;
  errorMsg = '';

  usuario: any = null;
  rol: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private session: SessionService,
    private router: Router           
  ) {}

  async ngOnInit() {
    // Sesión (para mostrar CTA si aplica)
    if (this.session.estaAutenticado()) {
      this.usuario = this.session.obtenerUsuario();
      this.rol = this.session.obtenerRol();
    }

    const documentId = this.route.snapshot.paramMap.get('id');
    if (!documentId) {
      this.errorMsg = 'Producto no encontrado.';
      this.isLoading = false;
      return;
    }

    try {
      const p = await this.api.getProductoByDocumentId(documentId);
      this.producto = p;

      // Normaliza imágenes según lo que entrega el servicio:
      // 1) Si algún día agregas p.imagenes (array), úsalo
      // 2) Si viene la relación cruda (p.imagen_url), construye URLs
      // 3) Si sólo viene p.imagenUrl (string), úsala
      const imgs: string[] = [];

      if (Array.isArray(p?.imagenes) && p.imagenes.length) {
        imgs.push(...p.imagenes);
      } else if (Array.isArray(p?.imagen_url) && p.imagen_url.length) {
        for (const f of p.imagen_url) {
          const u = f?.url;
          if (u) imgs.push(u.startsWith('http') ? u : this.BASE_URL + u);
        }
      } else if (p?.imagenUrl) {
        imgs.push(p.imagenUrl);
      }

      this.imagenes = imgs;
      this.imagenPrincipal = imgs[0] || null;
    } catch (err: any) {
      this.errorMsg = err?.message || 'Error al cargar producto.';
    } finally {
      this.isLoading = false;
    }
  }

  setImagenPrincipal(url: string) {
    this.imagenPrincipal = url;
  }

  formatPrecio(v: number | null | undefined) {
    if (v == null) return '';
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v);
  }

  crearPedido() {
    if (!this.producto) return;

    // Guarda el producto a pre-agregar
    sessionStorage.setItem('preAddProductDocId', this.producto.documentId || '');
    sessionStorage.setItem('preAddProductName', this.producto.nombre || '');
    sessionStorage.setItem('preAddProductQty', '1');

    // Navega a crear-pedido
    this.router.navigate(['/crear-pedido']);
  }
}
