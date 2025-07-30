import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-ver-ventas',
  templateUrl: './ver-ventas.page.html',
  styleUrls: ['./ver-ventas.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class VerVentasPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
