import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-ver-notificaciones',
  templateUrl: './ver-notificaciones.page.html',
  styleUrls: ['./ver-notificaciones.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class VerNotificacionesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
