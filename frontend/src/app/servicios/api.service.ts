// src/app/servicios/api.service.ts
import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private session: SessionService) { }

  // PRODUCTOS-----------------------------------------------------------------------------------------------

  async getProductos(): Promise<any[]> {
    const token = this.session.obtenerToken();

    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/productos?populate=*`, {
        headers
      });
      return response.data.data;
    } catch (error: any) {
      throw error.response?.data?.error?.message || 'Error al obtener productos';
    }
  }

 async getProductoByDocumentId(documentId: string): Promise<any> {
  const url = `${this.baseUrl}/productos?filters[documentId][$eq]=${documentId}&populate=*`;

    try {
      const response = await axios.get(url);
      const productoRaw = response.data.data[0];

      if (!productoRaw) throw new Error('Producto no encontrado');

      const producto = {
        id: productoRaw.id,
        documentId: productoRaw.documentId,
        nombre: productoRaw.nombre,
        descripcion: productoRaw.descripcion,
        precio: productoRaw.precio,
        //stock: productoRaw.stock || 0,
        imagenUrl: productoRaw.imagen_url?.[0]?.url
          ? `${this.baseUrl.replace('/api', '')}${productoRaw.imagen_url[0].url}`
          : null,
        categoria: productoRaw.categoria
      };

      return producto;
    } catch (error) {
      console.error('Error en getProductoByDocumentId:', error);
      throw 'Error al cargar producto';
    }
  }

  async createProducto(data: any): Promise<any> {
    const token = this.session.obtenerToken();
    try {
      const response = await axios.post(`${this.baseUrl}/productos`, { data }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error?.message || 'Error al crear producto';
    }
  }

  async updateProductoByDocumentId(documentId: string, data: any): Promise<any> {
    const token = this.session.obtenerToken();

    try {
      const putUrl = `${this.baseUrl}/productos/${documentId}`;
      const response = await axios.put(putUrl, { data }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;

    } catch (error: any) {
      console.error('Error al actualizar producto:', error);
      throw error.response?.data?.error?.message || 'Error al actualizar producto';
    }
  }

  async deleteProductoByDocumentId(documentId: string): Promise<any> {
    const token = this.session.obtenerToken();
    try {
      const url = `${this.baseUrl}/productos/${documentId}`; 
      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      //console.log('Producto eliminado con documentId:', documentId);
      return response.data;
    } catch (error: any) {
      console.error('Error al eliminar producto por documentId:', error.response?.data);
      throw error.response?.data?.error?.message || 'Error al eliminar producto';
    }
  }

  // CATEGORIAS-----------------------------------------------------------------------------------------------

  async getCategorias(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/categorias`);
      //console.log('Categorías desde la API:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al obtener categorías:', error);
      throw 'No se pudieron cargar las categorías';
    }
  }

  async getCategoriaByDocumentId(documentId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/categorias?filters[documentId][$eq]=${documentId}`);
      return response.data.data[0];
    } catch (error: any) {
      throw error.response?.data?.error?.message || 'Error al obtener categoría';
    }
  }

  async createCategoria(data: any): Promise<any> {
    const token = this.session.obtenerToken();
    try {
      const response = await axios.post(`${this.baseUrl}/categorias`, { data }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error?.message || 'Error al crear categoría';
    }
  }

  async updateCategoriaByDocumentId(documentId: string, data: any): Promise<any> {
    const token = this.session.obtenerToken();

    try {
      const response = await axios.put(`${this.baseUrl}/categorias/${documentId}`, { data }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar categoría:', error);
      throw error.response?.data?.error?.message || 'Error al actualizar categoría';
    }
  }

  async deleteCategoriaByDocumentId(documentId: string): Promise<any> {
    const token = this.session.obtenerToken();
    try {
      const response = await axios.delete(`${this.baseUrl}/categorias/${documentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error?.message || 'Error al eliminar categoría';
    }
  }

  // USUARIOS-----------------------------------------------------------------------------------------------

  async getUsuarios(): Promise<any[]> {
    const token = this.session.obtenerToken();

    try {
      const response = await axios.get(`${this.baseUrl}/users?populate=*`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      //console.log('Respuesta completa usuarios:', response.data);
      return response.data; 
    } catch (error: any) {
      console.error('Error en getUsuarios:', error.response?.data || error);
      throw error.response?.data?.error?.message || 'Error al obtener usuarios';
    }
  }

  async getRoles(): Promise<any[]> {
    const token = this.session.obtenerToken();

    try {
      const response = await axios.get(`${this.baseUrl}/users-permissions/roles`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data.roles;
    } catch (error: any) {
      console.error('Error en getRoles:', error.response?.data || error);
      throw error.response?.data?.error?.message || 'Error al obtener roles';
    }
  }

  async crearUsuario(data: any): Promise<any> {
    const token = this.session.obtenerToken();

    try {
      const response = await axios.post(`${this.baseUrl}/users`, {
        ...data,
        confirmed: true 
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Error en crearUsuario:', error.response?.data || error);
      throw error.response?.data?.error?.message || 'Error al crear usuario';
    }
  }

  async updateUsuario(id: number, data: any): Promise<any> {
    const token = this.session.obtenerToken();

    try {
      const response = await axios.put(`${this.baseUrl.replace('/api', '')}/api/users/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error.response?.data || error);
      throw error.response?.data?.error?.message || 'Error al actualizar usuario';
    }
  }

  async eliminarUsuario(id: number): Promise<any> {
    const token = this.session.obtenerToken();

    try {
      const response = await axios.delete(`${this.baseUrl}/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error en eliminarUsuario:', error.response?.data || error);
      throw error.response?.data?.error?.message || 'Error al eliminar usuario';
    }
  }

  async actualizarUsuario(id: number, data: any): Promise<any> {
    const token = this.session.obtenerToken();

    try {
      const response = await axios.put(`${this.baseUrl}/users/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error en actualizarUsuario:', error.response?.data || error);
      throw error.response?.data?.error?.message || 'Error al actualizar usuario';
    }
  }


  // VENTAS -----------------------------------------------------------------------------------------------

  async getVentas(): Promise<any[]> {
    const token = this.session.obtenerToken();
    try {
      const response = await axios.get(`${this.baseUrl}/ventas?populate[pedido][populate]=users_permissions_user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error al obtener ventas:', error);
      throw 'Error al cargar ventas';
    }
  }

  async getVentaByDocumentId(documentId: string): Promise<any> {
    const token = this.session.obtenerToken();

    //const url = `${this.baseUrl}/ventas?filters[documentId][$eq]=${documentId}&populate[pedido][populate][detalles_pedidos][populate]=producto`;
    const url = `${this.baseUrl}/ventas?filters[documentId][$eq]=${documentId}` +
    `&populate[pedido][populate][detalles_pedidos][populate]=producto` +
    `&populate[pedido][populate][users_permissions_user][populate]=role`;


    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return response.data.data[0];
    } catch (error: any) {
      console.error('Error al obtener detalle de venta:', error);
      throw 'No se pudo obtener el detalle de la venta';
    }
  }

  // PEDIDOS -----------------------------------------------------------------------------------------------

  async getMisPedidos(): Promise<any[]> {
    const token = this.session.obtenerToken();
    const userId = this.session.obtenerUsuario()?.id;

    if (!userId) throw 'Usuario no autenticado';

    try {
      const response = await axios.get(`${this.baseUrl}/pedidos?populate[detalles_pedidos][populate]=producto&populate=users_permissions_user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const pedidosUsuario = response.data.data
        .filter((pedido: any) => pedido.users_permissions_user?.id === userId)
        .sort((a: any, b: any) => {
          // Ordenar: pendientes primero, y por fecha más reciente
          if (a.estado === 'pendiente' && b.estado !== 'pendiente') return -1;
          if (a.estado !== 'pendiente' && b.estado === 'pendiente') return 1;

          return new Date(b.fecha_pedido).getTime() - new Date(a.fecha_pedido).getTime();
        });

      return pedidosUsuario;
    } catch (error: any) {
      console.error('Error al obtener pedidos del usuario:', error);
      throw 'No se pudieron obtener los pedidos';
    }
  }

  async cancelarPedidoByDocumentId(documentId: string): Promise<any> {
    const token = this.session.obtenerToken();

    try {
      const url = `${this.baseUrl}/pedidos/${documentId}`;
      const data = {
        estado: 'cancelado'
      };

      const response = await axios.put(url, { data }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Error al cancelar pedido:', error.response?.data || error);
      throw error.response?.data?.error?.message || 'Error al cancelar pedido';
    }
  }

  // CREAR PEDIDOS --------------------------------------------------------------------------

  async generarPedido(pedidoData: any, detalles: any[]): Promise<any> {
    const token = this.session.obtenerToken();

    try {
      const pedido = await axios.post(`${this.baseUrl}/pedidos`, { data: pedidoData }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const pedidoId = pedido.data.data.id;

      for (const d of detalles) {
        await axios.post(`${this.baseUrl}/detalles-pedidos`, {
          data: {
            cantidad: d.cantidad,
            subtotal: d.subtotal,
            pedido: pedidoId,
            producto: d.producto
          }
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      return pedido.data;
    } catch (error: any) {
      console.error('Error al generar pedido:', error);
      throw error.response?.data?.error?.message || 'No se pudo generar el pedido';
    }
  }

  // PANTALLAS DE PEDIDOS ---------------------------------------------------------------------

  async getPedidosAdmin(): Promise<any[]> {
    const token = this.session.obtenerToken();

    try {
      const response = await axios.get(`${this.baseUrl}/pedidos?populate=users_permissions_user`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener pedidos:', error);
      throw 'No se pudieron obtener los pedidos';
    }
  }

  async getPedidoCompleto(documentId: string): Promise<any> {
    const token = this.session.obtenerToken();
    const url = `${this.baseUrl}/pedidos?filters[documentId][$eq]=${documentId}` +
                `&populate[users_permissions_user]=true` +
                `&populate[detalles_pedidos][populate]=producto`;

    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data[0];
    } catch (error) {
      throw 'No se pudo cargar el pedido';
    }
  }

  async actualizarEstadoPedido(documentId: string, nuevoEstado: string): Promise<any> {
    const token = this.session.obtenerToken();

    try {
      const url = `${this.baseUrl}/pedidos/${documentId}`;
      return await axios.put(url, {
        data: { estado: nuevoEstado }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error: any) {
      throw error.response?.data?.error?.message || 'No se pudo actualizar el estado';
    }
  }

  async registrarVentaDesdePedido(documentId: string): Promise<any> {
    const token = this.session.obtenerToken();

    try {
      const pedido = await this.getPedidoCompleto(documentId);

      const ganancias_estimadas = pedido.detalles_pedidos.reduce((sum: number, d: any) => sum + d.subtotal, 0);

      const data = {
        fecha_venta: new Date().toISOString(),
        total: pedido.total,
        ganancias_estimadas,
        pedido: pedido.id
      };

      return await axios.post(`${this.baseUrl}/ventas`, { data }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      throw 'No se pudo registrar la venta';
    }
  }

  // -------------- SELF SERVICE (perfil propio)----------------------------

  /** Devuelve el usuario autenticado (incluye rol) */
  async getMe(): Promise<any> {
    const token = this.session.obtenerToken();
    if (!token) throw 'No autenticado';

    try {
      const res = await axios.get(`${this.baseUrl}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { populate: 'role' }
      });
      return res.data;
    } catch (error: any) {
      console.error('getMe:', error.response?.data || error);
      throw error.response?.data?.error?.message || 'No se pudo obtener tu perfil';
    }
  }

  /** Actualiza el usuario autenticado. 
   *  Strapi no expone PUT /users/me por defecto, así que:
   *   1) obtenemos /users/me para conocer el id
   *   2) hacemos PUT /users/:id
   */
  async updateMe(data: { username?: string; email?: string }): Promise<any> {
    const token = this.session.obtenerToken();
    if (!token) throw 'No autenticado';

    try {
      const me = await this.getMe();
      const res = await axios.put(`${this.baseUrl}/users/${me.id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data; 
    } catch (error: any) {
      console.error('updateMe:', error.response?.data || error);
      throw error.response?.data?.error?.message || 'No se pudo actualizar tu perfil';
    }
  }

  /** Cambiar contraseña del usuario autenticado */
  async changeMyPassword(body: {
    currentPassword: string;
    password: string;
    passwordConfirmation: string;
  }): Promise<void> {
    const token = this.session.obtenerToken();
    if (!token) throw 'No autenticado';

    try {
      await axios.post(`${this.baseUrl}/auth/change-password`, body, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error: any) {
      console.error('changeMyPassword:', error.response?.data || error);
      throw error.response?.data?.error?.message || 'No se pudo cambiar la contraseña';
    }
  }



}
