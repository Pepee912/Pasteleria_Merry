import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CategoriasService } from '../../../servicios/categorias.service';
// import { IonicModule } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-editar-categoria',
  templateUrl: './editar-categoria.page.html',
  styleUrls: ['./editar-categoria.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule], schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EditarCategoriaPage implements OnInit {
  id = '';
  nombre = '';

  constructor(
    private route: ActivatedRoute,
    private categoriasService: CategoriasService,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    const cat = await this.categoriasService.obtenerCategoria(this.id);
    this.nombre = cat.attributes.nombre;
  }

  async actualizar() {
    await this.categoriasService.actualizarCategoria(this.id, { nombre: this.nombre });
    this.navCtrl.navigateBack('/ver-categorias');
  }
}
