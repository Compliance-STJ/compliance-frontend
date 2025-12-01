import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NormaManual } from './norma-manual';

describe('NormaManual', () => {
  let component: NormaManual;
  let fixture: ComponentFixture<NormaManual>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NormaManual]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NormaManual);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
