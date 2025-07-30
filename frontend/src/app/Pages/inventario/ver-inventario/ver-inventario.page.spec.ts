import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerInventarioPage } from './ver-inventario.page';

describe('VerInventarioPage', () => {
  let component: VerInventarioPage;
  let fixture: ComponentFixture<VerInventarioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerInventarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
