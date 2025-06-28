import { Component } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { SessionService } from '../../servicios/session.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false
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

    const perfil = await this.auth.getPerfil(res.jwt); // Traemos los datos reales del usuario
    this.session.guardarUsuario(perfil); // Los Guárdamos en localStorage

    const rol = this.session.obtenerRol(); // Y ya guardados ahora sí leerá el rol 
    alert('Bienvenido, tu rol es: ' + rol);

    this.navCtrl.navigateRoot('/home');
  } catch (err) {
    alert('Error: ' + err);
  }
}
}
