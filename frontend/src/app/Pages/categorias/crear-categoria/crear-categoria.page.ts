import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/servicios/api.service';

@Component({
  selector: 'app-crear-categoria',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule],
  templateUrl: './crear-categoria.page.html',
  styleUrls: ['./crear-categoria.page.scss']
})
export class CrearCategoriaPage {
  nombre = '';

  constructor(private api: ApiService, private router: Router) {}

  async crearCategoria() {
    if (!this.nombre.trim()) {
      alert('Por favor ingresa un nombre válido');
      return;
    }

    try {
      await this.api.createCategoria({ nombre: this.nombre });
      alert('Categoría creada exitosamente');
      //this.router.navigate(['/ver-categorias']);
      window.location.href = '/ver-categorias';
    } catch (error) {
      alert('Error al crear categoría: ' + error);
    }
  }
}
