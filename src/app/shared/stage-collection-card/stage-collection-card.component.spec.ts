import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StageCollectionCardComponent } from './stage-collection-card.component';

describe('StageCollectionCardComponent', () => {
  let component: StageCollectionCardComponent;
  let fixture: ComponentFixture<StageCollectionCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StageCollectionCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StageCollectionCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
