import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from 'src/app/servicios/api.service';

@Component({
  selector: 'app-ver-categorias',
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
  templateUrl: './ver-categorias.page.html',
  styleUrls: ['./ver-categorias.page.scss']
})
export class VerCategoriasPage implements OnInit {
  categorias: any[] = [];

  constructor(private api: ApiService, private router: Router) {}

  async ngOnInit() {
    try {
      this.categorias = await this.api.getCategorias();
    } catch (error) {
      alert('Error al obtener categorías');
    }
  }

  irACrearCategoria() {
    this.router.navigate(['/crear-categoria']);
  }

  editarCategoria(documentId: string) {
    this.router.navigate(['/editar-categoria', documentId]);
  }

  async eliminarCategoria(documentId: string) {
    const confirmar = confirm('¿Deseas eliminar esta categoría?, si tiene algún producto relacionado este quedará sin categoría');
    if (!confirmar) return;

    try {
      await this.api.deleteCategoriaByDocumentId(documentId);
      this.categorias = this.categorias.filter(cat => cat.documentId !== documentId);
      alert('Categoría eliminada correctamente');
    } catch (error) {
      alert('Error al eliminar categoría: ' + error);
    }
  }

}
