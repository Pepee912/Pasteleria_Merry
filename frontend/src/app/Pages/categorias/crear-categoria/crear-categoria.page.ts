import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
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
  creando = false;

  constructor(
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

  async crearCategoria() {
    if (!this.nombre.trim()) {
      await this.showToast('Ingresa un nombre válido');
      return;
    }

    try {
      this.creando = true;
      await this.api.createCategoria({ nombre: this.nombre.trim() });
      await this.showToast('Categoría creada');
      this.router.navigate(['/ver-categorias']);
    } catch (error) {
      await this.showToast('Error al crear categoría');
    } finally {
      this.creando = false;
    }
  }
}
