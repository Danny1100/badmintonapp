import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerControllerComponent } from './player-controller.component';

describe('PlayerControllerComponent', () => {
  let component: PlayerControllerComponent;
  let fixture: ComponentFixture<PlayerControllerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PlayerControllerComponent]
    });
    fixture = TestBed.createComponent(PlayerControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
