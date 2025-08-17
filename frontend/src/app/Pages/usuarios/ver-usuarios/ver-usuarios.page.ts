import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/servicios/api.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ver-usuarios',
  templateUrl: './ver-usuarios.page.html',
  styleUrls: ['./ver-usuarios.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule]
})
export class VerUsuariosPage implements OnInit {

  terminoBusqueda: string = '';
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  cargando = false;

  constructor(
    private api: ApiService,
    private router: Router,
    private toast: ToastController,
    private alertCtrl: AlertController
  ) {}

  async ngOnInit() {
    await this.cargarUsuarios();
  }

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

  async cargarUsuarios() {
    try {
      this.cargando = true;
      const lista = await this.api.getUsuarios();
      this.usuarios = lista;
      this.filtrarUsuarios();
    } catch (error: any) {
      console.error('Error al cargar usuarios:', error);
      await this.showToast('No se pudieron cargar los usuarios');
    } finally {
      this.cargando = false;
    }
  }

  filtrarUsuarios() {
    const termino = this.terminoBusqueda.trim().toLowerCase();
    if (!termino) { this.usuariosFiltrados = [...this.usuarios]; return; }
    this.usuariosFiltrados = this.usuarios.filter(u =>
      (u.username || '').toLowerCase().includes(termino) ||
      (u.email || '').toLowerCase().includes(termino)
    );
  }

  irACrearUsuario() {
    this.router.navigate(['/crear-usuario']);
  }

  irAEditar(id: number) {
    this.router.navigate(['/editar-usuario'], { queryParams: { id } });
  }

  async bloquearUsuario(id: number, bloqueado: boolean) {
    const accion = bloqueado ? 'desbloquear' : 'bloquear';
    const alert = await this.alertCtrl.create({
    header: 'Confirmar',
    message: `¿Deseas ${accion} este usuario?`,
    cssClass: 'alert-pastel', 
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Sí, continuar',
        role: 'confirm',
        handler: async () => {
          try {
            await this.api.actualizarUsuario(id, { blocked: !bloqueado });
            await this.showToast(`Usuario ${accion}ado correctamente`);
            await this.cargarUsuarios();
          } catch (error: any) {
            await this.showToast('Error al actualizar el estado del usuario');
          }
        }
      }
    ]
  });
  await alert.present();
  }

  async eliminarUsuario(id: number) {
    const alert = await this.alertCtrl.create({
    header: 'Eliminar usuario',
    message: '¿Seguro? Esta acción es permanente.',
    cssClass: 'alert-pastel',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Eliminar',
        role: 'destructive',  
        handler: async () => {
          try {
            await this.api.eliminarUsuario(id);
            await this.showToast('Usuario eliminado');
            await this.cargarUsuarios();
          } catch (error: any) {
            await this.showToast('Error al eliminar usuario');
          }
        }
      }
    ]
  });
  await alert.present();

  }
}
