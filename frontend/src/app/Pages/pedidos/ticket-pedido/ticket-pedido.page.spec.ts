import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TicketPedidoPage } from './ticket-pedido.page';

describe('TicketPedidoPage', () => {
  let component: TicketPedidoPage;
  let fixture: ComponentFixture<TicketPedidoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketPedidoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
