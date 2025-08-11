import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AuthService } from 'src/app/servicios/auth.service';
import { SessionService } from 'src/app/servicios/session.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [CommonModule, IonicModule, FormsModule]
})
export class LoginPage {
  email = '';
  password = '';
  cargando = false;

  constructor(
    private auth: AuthService,
    private session: SessionService,
    private navCtrl: NavController,
    private toast: ToastController
  ) {}

  private async showToast(message: string) {
    const t = await this.toast.create({
      message,
      duration: 2200,
      position: 'top',
      cssClass: 'neutral-toast'
    });
    await t.present();
  }

  irRegistro() {
    this.navCtrl.navigateRoot('/registro');
  }

  async onLogin() {
    if (!this.email.trim() || !this.password.trim()) {
      return this.showToast('Ingresa correo y contraseña.');
    }
    this.cargando = true;
    try {
      const res = await this.auth.login(this.email.trim(), this.password);
      this.session.guardarToken(res.jwt);

      const perfil = await this.auth.getPerfil(res.jwt);
      this.session.guardarUsuario(perfil);

      //await this.showToast('¡Bienvenido!');
      this.navCtrl.navigateRoot('/');     
    } catch (err: any) {
      await this.showToast(typeof err === 'string' ? err : 'No se pudo iniciar sesión.');
    } finally {
      this.cargando = false;
    }
  }
}
