// src/app/pages/login/login.page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController } from '@ionic/angular';
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

  constructor(
    private auth: AuthService,
    private session: SessionService,
    private navCtrl: NavController
  ) {}

  async onLogin() {
    try {
      const res = await this.auth.login(this.email, this.password);
      this.session.guardarToken(res.jwt);

      const perfil = await this.auth.getPerfil(res.jwt);
      this.session.guardarUsuario(perfil);

      const rol = this.session.obtenerRol();
      //alert('Bienvenido, tu rol es: ' + rol);

      this.navCtrl.navigateRoot('/');
      setTimeout(() => location.reload(), 100); 

    } catch (err) {
      alert('Error: ' + err);
    }
  }
}
