import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ApiService } from 'src/app/servicios/api.service';

@Component({
  selector: 'app-actualizar-inventario',
  templateUrl: './actualizar-inventario.page.html',
  styleUrls: ['./actualizar-inventario.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule]
})
export class ActualizarInventarioPage implements OnInit {
  documentId = '';
  inventario: any = null;

  cantidad_actual: number = 0;
  unidad_medida: string = '';
  estado: string = 'disponible';

  constructor(private route: ActivatedRoute, private api: ApiService, private router: Router) {}

  async ngOnInit() {
    this.documentId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.documentId) return alert('Falta el documentId');

    try {
      const inventarios = await this.api.getInventarios();
      this.inventario = inventarios.find(inv => inv.documentId === this.documentId);

      if (!this.inventario) {
        alert('Inventario no encontrado');
        return;
      }

      this.cantidad_actual = this.inventario.cantidad_actual;
      this.unidad_medida = this.inventario.unidad_medida;
      this.estado = this.inventario.estado;
    } catch (error) {
      console.error(error);
      alert('Error al cargar inventario');
    }
  }

  async actualizarInventario() {
    if (this.cantidad_actual < 0 || this.unidad_medida.trim() === '') {
      alert('Todos los campos son obligatorios y válidos');
      return;
    }

    const data = {
      cantidad_actual: this.cantidad_actual,
      unidad_medida: this.unidad_medida,
      estado: this.estado,
      ultima_actualizacion: new Date().toISOString()
    };

    try {
      const token = this.api['session'].obtenerToken();
      const response = await fetch(`http://localhost:1337/api/inventarios/${this.documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data })
      });

      if (!response.ok) throw new Error('Error al actualizar inventario');

      alert('Inventario actualizado correctamente');
      //this.router.navigate(['/ver-inventario']);
      window.location.href = '/ver-inventario';
    } catch (error) {
      console.error(error);
      alert('No se pudo actualizar el inventario');
    }
  }
}
