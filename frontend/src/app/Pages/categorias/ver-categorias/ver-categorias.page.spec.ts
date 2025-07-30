import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerCategoriasPage } from './ver-categorias.page';

describe('VerCategoriasPage', () => {
  let component: VerCategoriasPage;
  let fixture: ComponentFixture<VerCategoriasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerCategoriasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
