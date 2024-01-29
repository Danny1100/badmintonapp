import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkedPlayersComponent } from './linked-players.component';

describe('LinkedPlayersComponent', () => {
  let component: LinkedPlayersComponent;
  let fixture: ComponentFixture<LinkedPlayersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LinkedPlayersComponent]
    });
    fixture = TestBed.createComponent(LinkedPlayersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
