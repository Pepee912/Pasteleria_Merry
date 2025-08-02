import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/servicios/api.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ver-usuarios',
  templateUrl: './ver-usuarios.page.html',
  styleUrls: ['./ver-usuarios.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule, FormsModule]
})
export class VerUsuariosPage implements OnInit {

  constructor(private api: ApiService, private router: Router) {}

  terminoBusqueda: string = '';
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];

  async ngOnInit() {
    await this.cargarUsuarios();
  }

  async cargarUsuarios() {
    try {
      const lista = await this.api.getUsuarios();
      this.usuarios = lista;
      this.filtrarUsuarios();
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  }

  filtrarUsuarios() {
    const termino = this.terminoBusqueda.trim().toLowerCase();

    if (!termino) {
      this.usuariosFiltrados = [...this.usuarios];
      return;
    }

    this.usuariosFiltrados = this.usuarios.filter(u =>
      u.username.toLowerCase().includes(termino) ||
      u.email.toLowerCase().includes(termino)
    );
  }

  irACrearUsuario() {
    this.router.navigate(['/crear-usuario']);
  }

  irAEditar(id: number) {
    this.router.navigate(['/editar-usuario'], {
      queryParams: { id }
    });
  }

  async bloquearUsuario(id: number, bloqueado: boolean) {
    const accion = bloqueado ? 'desbloquear' : 'bloquear';
    const confirmar = confirm(`¿Deseas ${accion} a este usuario?`);
    if (!confirmar) return;

    try {
      await this.api.actualizarUsuario(id, { blocked: !bloqueado });
      alert(`Usuario ${accion}ado correctamente.`);
      await this.cargarUsuarios(); 
    } catch (error) {
      console.error('Error al bloquear/desbloquear usuario:', error);
      alert('Error al actualizar estado del usuario: ' + error);
    }
  }

  async eliminarUsuario(id: number) {
    const confirmar = confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción es permanente.');
    if (!confirmar) return;

    try {
      await this.api.eliminarUsuario(id);
      alert('Usuario eliminado correctamente.');
      await this.cargarUsuarios(); 
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('Error al eliminar usuario: ' + error);
    }
  }




}
