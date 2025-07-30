import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-crear-pedido',
  templateUrl: './crear-pedido.page.html',
  styleUrls: ['./crear-pedido.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class CrearPedidoPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
