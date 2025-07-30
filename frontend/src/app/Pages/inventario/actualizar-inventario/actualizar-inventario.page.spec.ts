import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActualizarInventarioPage } from './actualizar-inventario.page';

describe('ActualizarInventarioPage', () => {
  let component: ActualizarInventarioPage;
  let fixture: ComponentFixture<ActualizarInventarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ActualizarInventarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
