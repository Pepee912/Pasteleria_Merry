import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/servicios/api.service';

@Component({
  selector: 'app-editar-categoria',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule],
  templateUrl: './editar-categoria.page.html',
  styleUrls: ['./editar-categoria.page.scss']
})
export class EditarCategoriaPage implements OnInit {
  documentId: string = '';
  nombre: string = '';

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) {}

  async ngOnInit() {
    this.documentId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.documentId) {
      alert('ID no válido');
      this.router.navigate(['/ver-categorias']);
      return;
    }

    try {
      const categoria = await this.api.getCategoriaByDocumentId(this.documentId);
      //console.log('Categoría recibida:', categoria);

      this.nombre = categoria?.nombre || '';
    } catch (error) {
      alert('Error al cargar categoría: ' + error);
    }
  }

  async actualizarCategoria() {
    if (!this.nombre.trim()) {
      alert('El nombre no puede estar vacío');
      return;
    }

    try {
      await this.api.updateCategoriaByDocumentId(this.documentId, { nombre: this.nombre });
      alert('Categoría actualizada correctamente');
      //this.router.navigate(['/ver-categorias']);
      window.location.href = '/ver-categorias';
    } catch (error) {
      alert('Error al actualizar categoría: ' + error);
    }
  }
}
