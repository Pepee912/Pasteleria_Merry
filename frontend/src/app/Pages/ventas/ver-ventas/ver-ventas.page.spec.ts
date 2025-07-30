import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerVentasPage } from './ver-ventas.page';

describe('VerVentasPage', () => {
  let component: VerVentasPage;
  let fixture: ComponentFixture<VerVentasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerVentasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
