import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StageCollectionListComponent } from './stage-collection-list.component';

describe('StageCollectionListComponent', () => {
  let component: StageCollectionListComponent;
  let fixture: ComponentFixture<StageCollectionListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StageCollectionListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StageCollectionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
