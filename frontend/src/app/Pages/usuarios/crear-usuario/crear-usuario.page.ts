import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/servicios/api.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
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

  constructor(private api: ApiService, private router: Router) {}

  async ngOnInit() {
    await this.cargarRoles();
  }

  async cargarRoles() {
    try {
      const rolesRaw = await this.api.getRoles();

      this.roles = rolesRaw.filter((rol: any) => rol.type !== 'authenticated');

      console.log('Roles visibles:', this.roles);
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  }

  async crearUsuario() {
    if (!this.username || !this.email || !this.password || !this.rolSeleccionado) {
      alert('Por favor completa todos los campos.');
      return;
    }

    // Validación: Email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      alert('El correo electrónico no es válido.');
      return;
    }

    // Validación: Contraseña mínimo 8 caracteres
    if (this.password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    try {
      await this.api.crearUsuario({
        username: this.username,
        email: this.email,
        password: this.password,
        role: this.rolSeleccionado,
        confirmed: true
      });

      alert('Usuario creado correctamente');
      //this.router.navigate(['/ver-usuarios']);
      window.location.href = '/ver-usuarios';
    } catch (error: any) {
      console.error('Error al crear usuario:', error);

      if (typeof error === 'string' && error.includes('email')) {
        alert('Este correo ya está registrado.');
      } else if (typeof error === 'string' && error.includes('username')) {
        alert('Este nombre ya está en uso.');
      } else {
        alert('Error al crear usuario: ' + error);
      }
    }
  }


}
