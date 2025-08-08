import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, NavController, AlertButton, AlertController } from '@ionic/angular';
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

  // Define the alert buttons
  public alertButtons: AlertButton[] = [
    {
      text: 'Aceptar',
      cssClass: 'alert-button-confirm',
      handler: async () => {
        try {
          // Attempt registration when the alert is triggered
          await this.auth.register(this.nombre, this.email, this.password);
          // Navigate to login page after clicking "Aceptar"
          this.navCtrl.navigateRoot('/login');
          return true; // Allow alert to close
        } catch (err) {
          // Show error alert if registration fails
          const errorAlert = await this.alertCtrl.create({
            header: 'Error',
            message: 'Error: ' + err,
            buttons: ['OK']
          });
          await errorAlert.present();
          return false; // Keep the success alert open
        }
      }
    }
  ];

  constructor(
    private auth: AuthService,
    private navCtrl: NavController,
    private alertCtrl: AlertController
  ) {}

  // Handle alert dismissal (optional, for additional logic if needed)
  onAlertDismiss(event: any) {
    // No additional logic needed since "Aceptar" handler manages registration and navigation
  }
}