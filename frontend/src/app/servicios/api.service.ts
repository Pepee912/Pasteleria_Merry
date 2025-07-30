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

      console.log('Producto bruto desde la API:', productoRaw);

      if (!productoRaw) throw new Error('Producto no encontrado');

      const producto = {
        id: productoRaw.id,
        nombre: productoRaw.nombre,
        descripcion: productoRaw.descripcion,
        precio: productoRaw.precio,
        stock: productoRaw.stock,
        imagenUrl: productoRaw.imagen_url?.[0]?.url
          ? `${this.baseUrl.replace('/api', '')}${productoRaw.imagen_url[0].url}`
          : null
      };

      console.log('Producto recibido:', producto);
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

  async updateProducto(id: string, data: any): Promise<any> {
    const token = this.session.obtenerToken();
    try {
      const response = await axios.put(`${this.baseUrl}/productos/${id}`, { data }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error?.message || 'Error al actualizar producto';
    }
  }

  async deleteProducto(id: string): Promise<any> {
    const token = this.session.obtenerToken();
    try {
      const response = await axios.delete(`${this.baseUrl}/productos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error?.message || 'Error al eliminar producto';
    }
  }

  
}
