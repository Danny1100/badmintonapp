import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WaitDurationComponent } from './wait-duration.component';

describe('WaitDurationComponent', () => {
  let component: WaitDurationComponent;
  let fixture: ComponentFixture<WaitDurationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WaitDurationComponent]
    });
    fixture = TestBed.createComponent(WaitDurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
