import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerNotificacionesPage } from './ver-notificaciones.page';

describe('VerNotificacionesPage', () => {
  let component: VerNotificacionesPage;
  let fixture: ComponentFixture<VerNotificacionesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerNotificacionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
