import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/servicios/api.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-crear-usuario',
  templateUrl: './crear-usuario.page.html',
  styleUrls: ['./crear-usuario.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule]
})
export class CrearUsuarioPage implements OnInit {
  username = '';
  email = '';
  password = '';
  rolSeleccionado: number | null = null;
  roles: any[] = [];
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

  async ngOnInit() {
    await this.cargarRoles();
  }

  async cargarRoles() {
    try {
      const rolesRaw = await this.api.getRoles();
      this.roles = rolesRaw.filter((rol: any) => rol.type !== 'authenticated');
      // console.log('Roles visibles:', this.roles);
    } catch (error) {
      console.error('Error al cargar roles:', error);
      await this.showToast('No se pudieron cargar los roles');
    }
  }

  async crearUsuario() {
    if (!this.username || !this.email || !this.password || !this.rolSeleccionado) {
      await this.showToast('Por favor completa todos los campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      await this.showToast('El correo electrónico no es válido');
      return;
    }

    if (this.password.length < 8) {
      await this.showToast('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      this.creando = true;
      await this.api.crearUsuario({
        username: this.username,
        email: this.email,
        password: this.password,
        role: this.rolSeleccionado,
        confirmed: true
      });

      await this.showToast('Usuario creado correctamente');
      this.router.navigate(['/ver-usuarios']);
    } catch (error: any) {
      console.error('Error al crear usuario:', error);

      const msg = typeof error === 'string'
        ? ( error.includes('email') ? 'Este correo ya está registrado'
          : error.includes('username') ? 'Este nombre ya está en uso'
          : `Error al crear usuario: ${error}` )
        : 'Error al crear usuario';

      await this.showToast(msg);
    } finally {
      this.creando = false;
    }
  }
}
