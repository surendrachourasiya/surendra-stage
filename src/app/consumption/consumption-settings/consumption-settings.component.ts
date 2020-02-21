import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { faClosedCaptioning, faAudioDescription, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-consumption-settings',
  templateUrl: './consumption-settings.component.html',
  styleUrls: ['./consumption-settings.component.scss']
})

export class ConsumptionSettingsComponent implements OnInit, OnChanges {
  faClosedCaptioning = faClosedCaptioning;
  faAudioDescription = faAudioDescription;
  isParantVisible = true;
  isQualitySelectorVisible = false;
  isCaptionSelectorVisible = false;
  faTimes = faTimes;
  selectedVideoQuality={
    name:null,
    value:null,
  }
  lang;

  @Input() passCurrentQuality:any;
  @Output() settingClose = new EventEmitter<boolean>();
  @Output() settingQualityChange = new EventEmitter<{name, value}>();
    
  constructor(private route: ActivatedRoute,) { }

  ngOnInit() {
    this.lang = this.route.snapshot.data.lang;
    this.selectedVideoQuality=this.passCurrentQuality;
  }

  ngOnChanges(){
    this.isParantVisible = true;
  }

  openLangSelector() {
    this.isParantVisible = false;
    this.isCaptionSelectorVisible = true;
  }

  openQualitySelector() {
    this.isParantVisible = false;
    this.isQualitySelectorVisible = true;
  }

  back() {
    this.isQualitySelectorVisible = false;
    this.isCaptionSelectorVisible = false;
    this.isParantVisible = true;
  }

  changeQuality(name, value){
    this.selectedVideoQuality.name=name;
    
    if(!!value)
      this.selectedVideoQuality.value=value;
    else
    this.selectedVideoQuality.value=null;

    this.isParantVisible = true;
    this.settingQualityChange.emit(this.selectedVideoQuality);
  }

  closeAll() {
    this.isParantVisible = true;
    // event emit for consumption
    this.settingClose.emit(false);
  }

}
