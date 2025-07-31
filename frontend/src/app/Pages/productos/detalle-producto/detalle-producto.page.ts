import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from 'src/app/servicios/api.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detalle-producto',
  templateUrl: './detalle-producto.page.html',
  styleUrls: ['./detalle-producto.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class DetalleProductoPage implements OnInit {
  producto: any = null;
  BASE_URL = 'http://localhost:1337';

  constructor(private route: ActivatedRoute, private api: ApiService) {}


async ngOnInit() {
  const documentId = this.route.snapshot.paramMap.get('id');
  if (documentId) {
    try {
      const producto = await this.api.getProductoByDocumentId(documentId);
      //console.log('Producto recibido:', producto); 
      this.producto = producto;
    } catch (error) {
      console.error('Error al cargar producto:', error);
    }
  }
}



}

