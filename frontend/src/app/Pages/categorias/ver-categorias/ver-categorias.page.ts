import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CategoriasService } from '../../..//servicios/categorias.service';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-ver-categorias',
  templateUrl: './ver-categorias.page.html',
  styleUrls: ['./ver-categorias.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule ], schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VerCategoriasPage implements OnInit {
  categorias: any[] = [];

  constructor(
    private categoriasService: CategoriasService,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    this.categorias = await this.categoriasService.obtenerCategorias();
  }

  editar(id: string) {
    this.navCtrl.navigateForward(`/editar-categoria/${id}`);
  }

  async eliminar(id: string) {
    await this.categoriasService.eliminarCategoria(id);
    this.categorias = await this.categoriasService.obtenerCategorias();
  }
}
