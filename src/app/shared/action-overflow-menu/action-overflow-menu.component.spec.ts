import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionOverflowMenuComponent } from './action-overflow-menu.component';

describe('ActionOverflowMenuComponent', () => {
  let component: ActionOverflowMenuComponent;
  let fixture: ComponentFixture<ActionOverflowMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActionOverflowMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionOverflowMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
