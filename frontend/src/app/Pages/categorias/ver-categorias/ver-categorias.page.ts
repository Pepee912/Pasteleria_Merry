import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-ver-categorias',
  templateUrl: './ver-categorias.page.html',
  styleUrls: ['./ver-categorias.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class VerCategoriasPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
