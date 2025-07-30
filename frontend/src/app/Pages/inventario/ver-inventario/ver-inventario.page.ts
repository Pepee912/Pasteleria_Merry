import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-ver-inventario',
  templateUrl: './ver-inventario.page.html',
  styleUrls: ['./ver-inventario.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class VerInventarioPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
