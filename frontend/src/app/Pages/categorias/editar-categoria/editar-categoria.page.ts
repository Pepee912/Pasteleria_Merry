import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
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
  cargando = false;
  guardando = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private toast: ToastController
  ) {}

  private async showToast(message: string, opts: Partial<Parameters<ToastController['create']>[0]> = {}) {
    const t = await this.toast.create({
      message,
      duration: 2000,
      position: 'top',
      cssClass: 'toast-clarito',
      ...opts
    });
    await t.present();
  }

  async ngOnInit() {
    this.documentId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.documentId) {
      await this.showToast('ID no válido');
      this.router.navigate(['/ver-categorias']);
      return;
    }

    try {
      this.cargando = true;
      const categoria = await this.api.getCategoriaByDocumentId(this.documentId);
      this.nombre = categoria?.nombre || '';
    } catch (error) {
      await this.showToast('Error al cargar categoría');
      this.router.navigate(['/ver-categorias']);
    } finally {
      this.cargando = false;
    }
  }

  async actualizarCategoria() {
    if (!this.nombre.trim()) {
      await this.showToast('El nombre no puede estar vacío');
      return;
    }

    try {
      this.guardando = true;
      await this.api.updateCategoriaByDocumentId(this.documentId, { nombre: this.nombre.trim() });
      await this.showToast('Categoría actualizada');
      this.router.navigate(['/ver-categorias']);
    } catch (error) {
      await this.showToast('Error al actualizar categoría');
    } finally {
      this.guardando = false;
    }
  }
}
