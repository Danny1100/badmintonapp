import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunMatchmakingComponent } from './run-matchmaking.component';

describe('RunMatchmakingComponent', () => {
  let component: RunMatchmakingComponent;
  let fixture: ComponentFixture<RunMatchmakingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunMatchmakingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunMatchmakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
