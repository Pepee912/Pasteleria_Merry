import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-ver-usuarios',
  templateUrl: './ver-usuarios.page.html',
  styleUrls: ['./ver-usuarios.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class VerUsuariosPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
