// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./Pages/main-home/main-home.page').then(m => m.MainHomePage)
  },
  {
    path: 'login',
    loadComponent: () => import('./Pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./Pages/registro/registro.page').then(m => m.RegistroPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'ver-producto',
    loadComponent: () => import('./Pages/productos/ver-producto/ver-producto.page').then( m => m.VerProductoPage),
    canActivate: [RoleGuard],
    data: { roles: ['Admin', 'Asistente'] }
  },
  {
    path: 'crear-producto',
    loadComponent: () => import('./Pages/productos/crear-producto/crear-producto.page').then( m => m.CrearProductoPage),
    canActivate: [RoleGuard],
    data: { roles: ['Admin', 'Asistente'] }
  },
  {
    path: 'editar-producto/:id',
    loadComponent: () => import('./Pages/productos/editar-producto/editar-producto.page').then(m => m.EditarProductoPage),
    canActivate: [RoleGuard],
    data: { roles: ['Admin', 'Asistente'] }
  },
  {
    path: 'productos/detalle-producto/:id',
    loadComponent: () => import('./Pages/productos/detalle-producto/detalle-producto.page').then(m => m.DetalleProductoPage)
  },
  {
    path: 'ver-categorias',
    loadComponent: () => import('./Pages/categorias/ver-categorias/ver-categorias.page').then( m => m.VerCategoriasPage),
    canActivate: [RoleGuard],
    data: { roles: ['Admin', 'Asistente'] }
  },
  {
    path: 'crear-categoria',
    loadComponent: () => import('./Pages/categorias/crear-categoria/crear-categoria.page').then( m => m.CrearCategoriaPage),
    canActivate: [RoleGuard],
    data: { roles: ['Admin', 'Asistente'] }
  },
  {
    path: 'editar-categoria/:id',
    loadComponent: () => import('./Pages/categorias/editar-categoria/editar-categoria.page').then( m => m.EditarCategoriaPage),
    canActivate: [RoleGuard],
    data: { roles: ['Admin', 'Asistente'] }
  },
  {
    path: 'ver-pedidos',
    loadComponent: () => import('./Pages/pedidos/ver-pedidos/ver-pedidos.page').then( m => m.VerPedidosPage),
    canActivate: [RoleGuard],
    data: { roles: ['Admin', 'Asistente'] }
  },
  {
    path: 'detalle-pedido/:id',
    loadComponent: () => import('./Pages/pedidos/detalle-pedido/detalle-pedido.page').then( m => m.DetallePedidoPage),
    canActivate: [RoleGuard],
    data: { roles: ['Admin', 'Asistente'] }
  },
  {
    path: 'crear-pedido',
    loadComponent: () => import('./Pages/pedidos/crear-pedido/crear-pedido.page').then( m => m.CrearPedidoPage),
    canActivate: [RoleGuard],
    data: { roles: ['Admin', 'Cliente'] }
  },
  {
    path: 'ver-ventas',
    loadComponent: () => import('./Pages/ventas/ver-ventas/ver-ventas.page').then( m => m.VerVentasPage),
    canActivate: [RoleGuard],
    data: { roles: ['Admin', 'Asistente'] }
  },
  {
    path: 'detalle-venta',
    loadComponent: () => import('./Pages/ventas/detalle-venta/detalle-venta.page').then( m => m.DetalleVentaPage),
    canActivate: [RoleGuard],
    data: { roles: ['Admin', 'Asistente'] }
  },
  {
    path: 'ver-notificaciones',
    loadComponent: () => import('./Pages/notificaciones/ver-notificaciones/ver-notificaciones.page').then( m => m.VerNotificacionesPage)
  },
  {
    path: 'detalle-notificacion',
    loadComponent: () => import('./Pages/notificaciones/detalle-notificacion/detalle-notificacion.page').then( m => m.DetalleNotificacionPage)
  },
  {
    path: 'ver-usuarios',
    loadComponent: () => import('./Pages/usuarios/ver-usuarios/ver-usuarios.page').then( m => m.VerUsuariosPage),
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'crear-usuario',
    loadComponent: () => import('./Pages/usuarios/crear-usuario/crear-usuario.page').then( m => m.CrearUsuarioPage),
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'editar-usuario',
    loadComponent: () => import('./Pages/usuarios/editar-usuario/editar-usuario.page').then( m => m.EditarUsuarioPage),
    canActivate: [RoleGuard],
    data: { roles: ['Admin'] }
  },
  {
    path: 'detalle-usuario',
    loadComponent: () => import('./Pages/usuarios/detalle-usuario/detalle-usuario.page').then( m => m.DetalleUsuarioPage),
    canActivate: [RoleGuard],
    data: { roles: ['Admin', 'Asistente', 'Cliente'] }
  },
  {
    path: 'mis-pedidos',
    loadComponent: () => import('./Pages/pedidos/mis-pedidos/mis-pedidos.page').then( m => m.MisPedidosPage),
    canActivate: [RoleGuard],
    data: { roles: ['Admin', 'Cliente'] }
  }

];