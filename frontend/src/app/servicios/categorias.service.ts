// src/app/servicios/categorias.service.ts
import { Injectable } from '@angular/core';
import axios from 'axios';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private apiUrl = 'http://localhost:1337/api/categorias';

  async obtenerCategorias() {
    const res = await axios.get(this.apiUrl + '?populate=*');
    return res.data.data;
  }

  async obtenerCategoria(id: string) {
    const res = await axios.get(`${this.apiUrl}/${id}?populate=*`);
    return res.data.data;
  }

  async crearCategoria(data: any) {
    return axios.post(this.apiUrl, { data });
  }

  async actualizarCategoria(id: string, data: any) {
    return axios.put(`${this.apiUrl}/${id}`, { data });
  }

  async eliminarCategoria(id: string) {
    return axios.delete(`${this.apiUrl}/${id}`);
  }
}
