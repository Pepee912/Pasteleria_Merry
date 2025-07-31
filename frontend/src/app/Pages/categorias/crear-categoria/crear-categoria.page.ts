import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CategoriasService } from '../../../servicios/categorias.service';
// import { IonicModule } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-crear-categoria',
  templateUrl: './crear-categoria.page.html',
  styleUrls: ['./crear-categoria.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule ], schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CrearCategoriaPage {
  nombre = '';

  constructor(private categoriasService: CategoriasService, private navCtrl: NavController) {}

  async crear() {
    await this.categoriasService.crearCategoria({ nombre: this.nombre });
    this.navCtrl.navigateBack('/ver-categorias');
  }
}
