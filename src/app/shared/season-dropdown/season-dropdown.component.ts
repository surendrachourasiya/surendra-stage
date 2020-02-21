import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-season-dropdown',
  templateUrl: './season-dropdown.component.html',
  styleUrls: ['./season-dropdown.component.scss']
})
export class SeasonDropdownComponent implements OnInit {

  selectedSeasonIndex:number=0;

  @Input() seasonListObj;
  @Input() seasonEnable:boolean;

  @Output() seasonDisable = new EventEmitter<boolean>();
  @Output() selectSeasonList = new EventEmitter<number>();
  
  constructor() { }

  ngOnInit() { }
  
  toggleSeasonPanel(value: boolean) {
    this.seasonEnable = value;
    this.seasonDisable.emit(value);
  }  

  passSeasonId(id: number) {
    if (this.selectedSeasonIndex != id){
      this.selectSeasonList.emit(id);
    }
    this.selectedSeasonIndex= id;
    this.toggleSeasonPanel(false);
  }
}
