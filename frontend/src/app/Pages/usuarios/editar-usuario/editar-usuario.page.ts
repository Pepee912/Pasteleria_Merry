import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
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

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) {}

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
      const usuarios = await this.api.getUsuarios();
      const usuario = usuarios.find(u => u.id === this.idUsuario);
      if (!usuario) throw 'Usuario no encontrado';

      this.username = usuario.username;
      this.email = usuario.email;
      this.rolSeleccionado = usuario.role?.id || null;
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      alert('Error al cargar usuario');
    }
  }

  async cargarRoles() {
    try {
      const rolesRaw = await this.api.getRoles();
      this.roles = rolesRaw.filter((rol: any) => rol.type !== 'authenticated');
    } catch (error) {
      console.error('Error al cargar roles:', error);
    }
  }

  async guardarCambios() {
    if (!this.username || !this.email || !this.rolSeleccionado) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    try {
      const data: any = {
        username: this.username,
        email: this.email,
        role: this.rolSeleccionado
      };

      // Solo incluir contraseña si se ingresó una nueva
      if (this.password) {
        if (this.password.length < 8) {
          alert('La contraseña debe tener al menos 8 caracteres.');
          return;
        }
        data.password = this.password;
      }

      await this.api.updateUsuario(this.idUsuario, data);
      alert('Usuario actualizado correctamente');
      //this.router.navigate(['/ver-usuarios']);
      window.location.href = '/ver-usuarios';
    } catch (error: any) {
      alert('Error al actualizar usuario: ' + error);
    }
  }
}
