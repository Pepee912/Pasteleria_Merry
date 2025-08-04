import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment';
import { SessionService } from 'src/app/servicios/session.service';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
private baseUrl = environment.apiUrl;

  constructor(private session: SessionService) {}

  // GET all pedidos
  async getPedidos(): Promise<any[]> {
    const token = this.session.obtenerToken();
    const headers: any = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/pedidos?populate=*`, {
        headers
      });
      return response.data.data;
    } catch (error: any) {
      throw error.response?.data?.error?.message || 'Error al obtener pedidos';
    }
  }

  // GET pedido by documentId
  async getPedidoByDocumentId(documentId: string): Promise<any> {
    const url = `${this.baseUrl}/pedidos?filters[documentId][$eq]=${documentId}&populate=*`;

    try {
      const response = await axios.get(url);
      const pedidoRaw = response.data.data[0];

      if (!pedidoRaw) throw new Error('Pedido no encontrado');

      const pedido = {
        id: pedidoRaw.id,
        estado: pedidoRaw.estado,
        fecha_pedido: pedidoRaw.fecha_pedido,
        fecha_entrega: pedidoRaw.fecha_entrega,
        total: pedidoRaw.total,
        notas: pedidoRaw.notas,
        users_permissions_user: pedidoRaw.users_permissions_user,
        detalles_pedidos: pedidoRaw.detalles_pedidos
      };

      return pedido;
    } catch (error) {
      console.error('Error en getPedidoByDocumentId:', error);
      throw 'Error al cargar pedido';
    }
  }

  // CREATE pedido
  async createPedido(data: any): Promise<any> {
    const token = this.session.obtenerToken();
    console.log('Payload enviado:', data); // Agrega esta línea para depurar
    try {
      const response = await axios.post(`${this.baseUrl}/pedidos`, { data }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Detalles del error:', error.response?.data);
      throw error.response?.data?.error?.message || 'Error al crear pedido';
    }
  }

  // UPDATE pedido by documentId
  async updatePedidoByDocumentId(documentId: string, data: any): Promise<any> {
    const token = this.session.obtenerToken();
    const pedido = await this.getPedidoByDocumentId(documentId);
    if (!pedido) throw new Error('Pedido no encontrado');

    try {
      const putUrl = `${this.baseUrl}/pedidos/${pedido.id}`;
      const response = await axios.put(putUrl, { data }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('Error al actualizar pedido:', error);
      throw error.response?.data?.error?.message || 'Error al actualizar pedido';
    }
  }

  // DELETE pedido by documentId
  async deletePedidoByDocumentId(documentId: string): Promise<any> {
    const token = this.session.obtenerToken();
    const pedido = await this.getPedidoByDocumentId(documentId);
    if (!pedido) throw new Error('Pedido no encontrado');

    try {
      const url = `${this.baseUrl}/pedidos/${pedido.id}`;
      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error al eliminar pedido por documentId:', error.response?.data);
      throw error.response?.data?.error?.message || 'Error al eliminar pedido';
    }
  }
}
