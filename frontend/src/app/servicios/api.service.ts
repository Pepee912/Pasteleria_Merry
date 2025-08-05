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
      stock: productoRaw.stock || 0,
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

  // INVENTARIO-----------------------------------------------------------------------------------------------

  async createInventario(data: any): Promise<any> {
    const token = this.session.obtenerToken();
    try {
      const response = await axios.post(`${this.baseUrl}/inventarios`, { data }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al crear inventario:', error);
      throw error.response?.data?.error?.message || 'Error al crear inventario';
    }
  }

  async getInventarios(): Promise<any[]> {
    const token = this.session.obtenerToken();
    try {
      const response = await axios.get(`${this.baseUrl}/inventarios?populate=*`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error: any) {
      console.error('Error al obtener inventarios:', error);
      throw 'Error al cargar inventarios';
    }
  }

  async getInventarioByDocumentId(documentId: string): Promise<any> {
    const token = this.session.obtenerToken();
    const response = await axios.get(`${this.baseUrl}/inventarios?filters[documentId][$eq]=${documentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data[0];
  }

  // VENTAS -----------------------------------------------------------------------------------------------

  async getVentas(): Promise<any[]> {
    const token = this.session.obtenerToken();
    try {
      const response = await axios.get(`${this.baseUrl}/ventas?populate=pedido`, {
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

    const url = `${this.baseUrl}/ventas?filters[documentId][$eq]=${documentId}&populate[pedido][populate][detalles_pedidos][populate]=producto`;

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

}
