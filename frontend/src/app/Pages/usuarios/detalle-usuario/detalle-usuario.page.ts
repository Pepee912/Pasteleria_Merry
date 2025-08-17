import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SessionService } from 'src/app/servicios/session.service';
import { ApiService } from 'src/app/servicios/api.service';

@Component({
  selector: 'app-detalle-usuario',
  templateUrl: './detalle-usuario.page.html',
  styleUrls: ['./detalle-usuario.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule]
})
export class DetalleUsuarioPage implements OnInit {
  usuario: any = null;
  isLoading = false;
  errorMsg = '';
  rolClase = '';

  // Modales
  modalEditarAbierto = false;
  modalPwdAbierto = false;

  // Formularios
  formEdit = { username: '', email: '' };
  formPwdData = { currentPassword: '', password: '', passwordConfirmation: '' };
  saving = false;

  constructor(
    private session: SessionService,
    private api: ApiService,
    private toast: ToastController
  ) {}

  ngOnInit() {
    this.cargarUsuario();
  }

  ionViewWillEnter() {
    this.cargarUsuario();
  }

  async cargarUsuario() {
    try {
      this.isLoading = true;
      this.errorMsg = '';

      // Intenta Strapi; si falla toma la sesión local
      const u = await this.api.getMe().catch(() => this.session.obtenerUsuario());

      if (!u) { this.usuario = null; return; }

      this.usuario = u;
      this.formEdit.username = u.username || '';
      this.formEdit.email = u.email || '';

      const role = (u.role?.name || '').toLowerCase();
      if (role.includes('admin')) this.rolClase = 'rol-admin';
      else if (role.includes('asistente')) this.rolClase = 'rol-asistente';
      else this.rolClase = 'rol-cliente';

      try { localStorage.setItem('user', JSON.stringify(u)); } catch {}
    } catch (e: any) {
      this.errorMsg = e?.message || 'No se pudo cargar el perfil.';
    } finally {
      this.isLoading = false;
    }
  }

  obtenerIniciales(nombre: string): string {
    if (!nombre) return '';
    return nombre.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatFecha(value: string | Date | undefined): string {
    if (!value) return '';
    const d = new Date(value);
    return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: 'long', day: '2-digit' }).format(d);
  }

  // Helper de toast gris claro (usa cssClass 'toast-clarito' del SCSS)
  private async showToast(message: string, opts: Partial<Parameters<ToastController['create']>[0]> = {}) {
    const t = await this.toast.create({
      message,
      duration: 1800,
      position: 'top',
      cssClass: 'toast-clarito',
      ...opts
    });
    await t.present();
  }

  async copiar(texto: string) {
    try {
      await navigator.clipboard.writeText(texto || '');
      await this.showToast('Copiado al portapapeles');
    } catch {
      await this.showToast('No se pudo copiar');
    }
  }

  // ---- Editar perfil ----
  abrirEditarPerfil() { this.modalEditarAbierto = true; }
  cerrarEditarPerfil() { this.modalEditarAbierto = false; }

  async guardarPerfil() {
    try {
      this.saving = true;
      const payload = {
        username: this.formEdit.username?.trim(),
        email: this.formEdit.email?.trim()
      };
      const updated = await this.api.updateMe(payload);

      this.usuario = { ...this.usuario, ...updated };
      try { localStorage.setItem('user', JSON.stringify(this.usuario)); } catch {}

      await this.showToast('Perfil actualizado');
      this.cerrarEditarPerfil();
    } catch (e: any) {
      await this.showToast(e?.message || 'No se pudo actualizar');
    } finally {
      this.saving = false;
    }
  }

  // ---- Cambiar contraseña ----
  abrirCambiarPassword() {
    this.formPwdData = { currentPassword: '', password: '', passwordConfirmation: '' };
    this.modalPwdAbierto = true;
  }
  cerrarCambiarPassword() { this.modalPwdAbierto = false; }

  async guardarPassword() {
    try {
      if (this.formPwdData.password !== this.formPwdData.passwordConfirmation) {
        await this.showToast('Las contraseñas no coinciden');
        return;
      }
      this.saving = true;
      await this.api.changeMyPassword({ ...this.formPwdData });
      await this.showToast('Contraseña actualizada');
      this.cerrarCambiarPassword();
    } catch (e: any) {
      await this.showToast(e?.message || 'No se pudo cambiar la contraseña');
    } finally {
      this.saving = false;
    }
  }

  // Pull to refresh
  refrescar(ev: CustomEvent) {
    this.cargarUsuario().finally(() => {
      setTimeout(() => (ev.target as HTMLIonRefresherElement).complete(), 250);
    });
  }
}
