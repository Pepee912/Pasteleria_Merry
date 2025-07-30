import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-actualizar-inventario',
  templateUrl: './actualizar-inventario.page.html',
  styleUrls: ['./actualizar-inventario.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ActualizarInventarioPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
