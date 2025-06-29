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

  constructor(private session: SessionService) {}

  async getProductos(): Promise<any[]> {
    const token = this.session.obtenerToken();
    try {
      const response = await axios.get(`${this.baseUrl}/productos?populate=*`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data.data;
    } catch (error: any) {
      throw error.response?.data?.error?.message || 'Error al obtener productos';
    }
  }
}
