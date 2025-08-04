import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/servicios/api.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-detalle-venta',
  standalone: true,
  templateUrl: './detalle-venta.page.html',
  styleUrls: ['./detalle-venta.page.scss'],
  imports: [CommonModule, IonicModule, RouterModule]
})
export class DetalleVentaPage implements OnInit {
  venta: any = null;

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  async ngOnInit() {
    const documentId = this.route.snapshot.queryParamMap.get('id');
    if (!documentId) return;

    try {
      this.venta = await this.api.getVentaByDocumentId(documentId);
    } catch (error) {
      alert('No se pudo cargar la venta: ' + error);
    }
  }
}
