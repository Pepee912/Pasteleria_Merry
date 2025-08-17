import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ApiService } from 'src/app/servicios/api.service';

@Component({
  selector: 'app-editar-usuario',
  templateUrl: './editar-usuario.page.html',
  styleUrls: ['./editar-usuario.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule]
})
export class EditarUsuarioPage implements OnInit {
  idUsuario!: number;
  username = '';
  email = '';
  password = '';
  rolSeleccionado: number | null = null;
  roles: any[] = [];
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
    this.route.queryParams.subscribe(async params => {
      if (params['id']) {
        this.idUsuario = +params['id'];
        await this.cargarUsuario();
        await this.cargarRoles();
      }
    });
  }

  async cargarUsuario() {
    try {
      this.cargando = true;
      const usuarios = await this.api.getUsuarios();
      const usuario = usuarios.find((u: any) => u.id === this.idUsuario);
      if (!usuario) throw new Error('Usuario no encontrado');
      this.username = usuario.username;
      this.email = usuario.email;
      this.rolSeleccionado = usuario.role?.id || null;
    } catch (error: any) {
      console.error('Error al cargar usuario:', error);
      await this.showToast('No se pudo cargar el usuario');
      this.router.navigate(['/ver-usuarios']);
    } finally {
      this.cargando = false;
    }
  }

  async cargarRoles() {
    try {
      const rolesRaw = await this.api.getRoles();
      this.roles = rolesRaw.filter((rol: any) => rol.type !== 'authenticated');
    } catch (error) {
      console.error('Error al cargar roles:', error);
      await this.showToast('No se pudieron cargar los roles');
    }
  }

  async guardarCambios() {
    if (!this.username || !this.email || !this.rolSeleccionado) {
      await this.showToast('Todos los campos son obligatorios');
      return;
    }

    const data: any = {
      username: this.username,
      email: this.email,
      role: this.rolSeleccionado
    };

    if (this.password) {
      if (this.password.length < 8) {
        await this.showToast('La contraseña debe tener al menos 8 caracteres');
        return;
      }
      data.password = this.password;
    }

    try {
      this.guardando = true;
      await this.api.updateUsuario(this.idUsuario, data);
      await this.showToast('Usuario actualizado');
      this.router.navigate(['/ver-usuarios']);
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error);
      await this.showToast('Error al actualizar usuario');
    } finally {
      this.guardando = false;
    }
  }
}
