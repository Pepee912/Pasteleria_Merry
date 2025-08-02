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

  editarCategoria(id: string) {
    alert('Botón editar (estático por ahora)');
  }

  eliminarCategoria(id: string) {
    alert('Botón eliminar (estático por ahora)');
  }
}
