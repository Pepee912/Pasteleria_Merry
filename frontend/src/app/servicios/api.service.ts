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

  // PRODUCTOS

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
      //console.log('Respuesta completa de producto por documentId:', response.data.data[0]);

      if (!productoRaw) throw new Error('Producto no encontrado');

      const producto = {
        id: productoRaw.id,
        nombre: productoRaw.nombre,
        descripcion: productoRaw.descripcion,
        precio: productoRaw.precio,
        stock: productoRaw.stock,
        imagenUrl: productoRaw.imagen_url?.[0]?.url
          ? `${this.baseUrl.replace('/api', '')}${productoRaw.imagen_url[0].url}`
          : null,
        categoria: productoRaw.categoria // simplemente así
      };


      //console.log('Producto recibido:', producto);
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

  // CATEGORIAS

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

  async getCategoriaByDocumentId(documentId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/categorias?filters[documentId][$eq]=${documentId}`);
      return response.data.data[0];
    } catch (error: any) {
      throw error.response?.data?.error?.message || 'Error al obtener categoría';
    }
  }


  async getCategorias(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/categorias`);
      console.log('Categorías desde la API:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('Error al obtener categorías:', error);
      throw 'No se pudieron cargar las categorías';
    }
  }

}
