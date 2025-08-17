import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
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
  cargando = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastController,
    private alertCtrl: AlertController
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
    try {
      this.cargando = true;
      this.categorias = await this.api.getCategorias();
    } catch (error) {
      await this.showToast('Error al obtener categorías');
    } finally {
      this.cargando = false;
    }
  }

  irACrearCategoria() {
    this.router.navigate(['/crear-categoria']);
  }

  editarCategoria(documentId: string) {
    this.router.navigate(['/editar-categoria', documentId]);
  }

  async eliminarCategoria(documentId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar categoría',
      message: '¿Deseas eliminar esta categoría? Si tiene productos relacionados, estos quedarán sin categoría.',
      cssClass: 'alert-pastel',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.api.deleteCategoriaByDocumentId(documentId);
              this.categorias = this.categorias.filter(cat => cat.documentId !== documentId);
              await this.showToast('Categoría eliminada');
            } catch (error) {
              await this.showToast('Error al eliminar categoría');
            }
          }
        }
      ]
    });
    await alert.present();
  }
}
