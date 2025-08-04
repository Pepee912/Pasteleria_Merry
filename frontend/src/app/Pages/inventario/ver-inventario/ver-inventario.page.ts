import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/servicios/api.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ver-inventario',
  templateUrl: './ver-inventario.page.html',
  styleUrls: ['./ver-inventario.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule]
})
export class VerInventarioPage implements OnInit {
  inventarios: any[] = [];
  inventariosFiltrados: any[] = [];

  terminoBusqueda: string = '';

  constructor(private api: ApiService, private router: Router) {}

  async ngOnInit() {
    try {
      this.inventarios = await this.api.getInventarios();
      this.filtrarInventarios();
    } catch (error) {
      alert('Error al cargar inventarios: ' + error);
    }
  }

  filtrarInventarios() {
    const termino = this.terminoBusqueda.trim().toLowerCase();

    if (!termino) {
      this.inventariosFiltrados = [...this.inventarios];
      return;
    }

    this.inventariosFiltrados = this.inventarios.filter(inv =>
      inv.producto?.nombre?.toLowerCase().includes(termino)
    );
  }

  irAEditar(inventarioId: string) {
    this.router.navigate(['/actualizar-inventario', inventarioId]);
  }
}
