import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-detalle-notificacion',
  templateUrl: './detalle-notificacion.page.html',
  styleUrls: ['./detalle-notificacion.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class DetalleNotificacionPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
