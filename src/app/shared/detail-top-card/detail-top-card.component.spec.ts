import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailTopCardComponent } from './detail-top-card.component';

describe('DetailTopCardComponent', () => {
  let component: DetailTopCardComponent;
  let fixture: ComponentFixture<DetailTopCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailTopCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailTopCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
