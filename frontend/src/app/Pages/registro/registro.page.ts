import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
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

  cargando = false;

  constructor(
    private auth: AuthService,
    private navCtrl: NavController,
    private toastCtrl: ToastController
  ) {}

  private async showToast(message: string) {
    const t = await this.toastCtrl.create({
      message,
      duration: 2200,
      position: 'top',
      cssClass: 'neutral-toast' // gris claro + bordes redondeados
    });
    await t.present();
  }

  irLogin() {
    this.navCtrl.navigateRoot('/login');
  }

  async registrar() {
    if (!this.nombre?.trim() || !this.email?.trim() || !this.password?.trim()) {
      await this.showToast('Completa nombre, correo y contraseña.');
      return;
    }

    this.cargando = true;
    try {
      await this.auth.register(this.nombre.trim(), this.email.trim(), this.password);
      await this.showToast('Cuenta creada. Inicia sesión.');
      this.navCtrl.navigateRoot('/login');
    } catch (err: any) {
      const msg = typeof err === 'string' ? err : 'No se pudo registrar. Intenta de nuevo.';
      await this.showToast(msg);
    } finally {
      this.cargando = false;
    }
  }
}
