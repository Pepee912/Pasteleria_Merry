import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearPedidoPage } from './crear-pedido.page';

describe('CrearPedidoPage', () => {
  let component: CrearPedidoPage;
  let fixture: ComponentFixture<CrearPedidoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearPedidoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
