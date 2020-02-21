import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-full-consumption',
  templateUrl: './full-consumption.component.html',
  styleUrls: ['./full-consumption.component.scss']
  // styleUrls: ['../consumption/consumption.component.scss']
})
export class FullConsumptionComponent implements OnInit, OnDestroy {

  constructor() { }

  ngOnInit() {
    $('html').addClass('ghumja');
  }
  ngOnDestroy() {
    $('html').removeClass('ghumja');
  }

}
