import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerPedidosPage } from './ver-pedidos.page';

describe('VerPedidosPage', () => {
  let component: VerPedidosPage;
  let fixture: ComponentFixture<VerPedidosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerPedidosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
