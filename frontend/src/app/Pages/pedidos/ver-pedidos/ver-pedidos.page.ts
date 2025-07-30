import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-ver-pedidos',
  templateUrl: './ver-pedidos.page.html',
  styleUrls: ['./ver-pedidos.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class VerPedidosPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
