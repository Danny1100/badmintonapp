import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayModeComponent } from './display-mode.component';

describe('DisplayModeComponent', () => {
  let component: DisplayModeComponent;
  let fixture: ComponentFixture<DisplayModeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayModeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
