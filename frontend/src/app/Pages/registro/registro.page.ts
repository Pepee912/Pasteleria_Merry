import { Component } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: false
})
export class RegistroPage {

nombre = '';
email = '';
password = '';

  constructor(private auth: AuthService, private navCtrl: NavController) {}

  async onSubmit() {
    try {
      const res = await this.auth.register(this.nombre, this.email, this.password);
      alert('Registro exitoso');
      this.navCtrl.navigateRoot('/login');
    } catch (err) {
      alert('Error: ' + err);
    }
  }

}
