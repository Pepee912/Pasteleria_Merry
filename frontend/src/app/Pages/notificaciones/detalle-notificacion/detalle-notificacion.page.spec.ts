import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleNotificacionPage } from './detalle-notificacion.page';

describe('DetalleNotificacionPage', () => {
  let component: DetalleNotificacionPage;
  let fixture: ComponentFixture<DetalleNotificacionPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleNotificacionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
