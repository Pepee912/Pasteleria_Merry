// src/app/pages/registro/registro.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/servicios/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule]
})
export class RegistroPage {
  nombre = '';
  email = '';
  password = '';

  constructor(
    private auth: AuthService,
    private navCtrl: NavController
  ) {}

  async onSubmit() {
    try {
      await this.auth.register(this.nombre, this.email, this.password);
      alert('Registro exitoso');
      this.navCtrl.navigateRoot('/login');
    } catch (err) {
      alert('Error: ' + err);
    }
  }
}
