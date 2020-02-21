import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import {
  faAngleUp,
  faAngleDown
} from '@fortawesome/free-solid-svg-icons';
import { ApiService } from 'src/app/shared/others/api.service.js';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-full-consumption-playlist-drawer',
  templateUrl: './full-consumption-playlist-drawer.component.html',
  // styleUrls: ['./full-consumption-playlist-drawer.component.scss']
  styleUrls: ['../../consumption/consumption-playlist-drawer/consumption-playlist-drawer.component.scss']
})
export class FullConsumptionPlaylistDrawerComponent implements OnInit {

  
  @Input() artistDrawerObj;
  @Input() artistDrawerS3Url;
  @Input() type;
  @Input() commonData;
  @Input() activeElementIndex;

  @Output() moveSelectedContent = new EventEmitter<number>();
  @Output() openCloseDrawer = new EventEmitter<boolean>();

  faAngleUp = faAngleUp;
  faAngleDown = faAngleDown;
  amplitudeArr = [];

  isSliderOn = false;
  isQuickviewVisible:boolean = false;

  amplitudeObj = {
    User_ID: 'null', 
    TIMESTAMP: ''
  }
  lang;

  constructor(private apiService: ApiService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.lang = this.route.snapshot.data.lang;
  }
  
  changeVideo(event:number){
    this.moveSelectedContent.emit(event);
    this.isSliderOn= false;
  }

  // toggle event for quick view
  quickViewToggle(show: boolean) {
    this.isQuickviewVisible = show;
  }
  
  toggleslide() {
    this.isSliderOn = !this.isSliderOn;
    this.openCloseDrawer.emit(this.isSliderOn);

    // Amplitude Code
    this.amplitudeObj['ARTIST_ID'] = this.commonData['_id'];
    this.amplitudeObj['VIDEO_ID'] = this.commonData['hlsSourceLink'];
    this.amplitudeObj['VIDEO_DURATION'] =  this.apiService.convertVideoTimeFormat(this.commonData['duration']);
    this.amplitudeObj['VIDEO_CONSUMED'] = this.apiService.convertVideoTimeFormat(this.commonData['lapsedPercent']);
    this.apiService.getAmplitudeInstance('cws_drawer', this.amplitudeObj);
  }

  moreVideoEvent() {
    this.amplitudeArr = []; 
      this.artistDrawerObj.forEach(item => {
        var id = 'full_similar_content_' + item._id;
        // code to check element is in viewport - start
        if ($("#" + id).offset() != undefined) {
          var top_of_element = $("#" + id).offset().top;
          var left_of_element = $("#" + id).offset().left;
          var bottom_of_element = $("#" + id).offset().top + $("#" + id).outerHeight();
          var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
          var top_of_screen = $(window).scrollTop();
          // code to check element is in viewport - end

          if (top_of_element >=0 && left_of_element >= 0 && (bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)) {
            // the element is visible, do something
            
            this.amplitudeArr.push(item.hlsSourceLink);
          }
        }
      });
  }

  onScrollCard() {
    this.moreVideoEvent();
    var moreVideoObj = {"ARTIST_ID": this.commonData['_id'], "VIDEO": this.commonData['hlsSourceLink'], "VIDEO_DURATION": this.apiService.convertVideoTimeFormat(this.commonData['duration']),
                        "VIDEO_CONSUMED": this.apiService.convertVideoTimeFormat(this.commonData['lapsedPercent']), "VIDEO_IDs": this.amplitudeArr}
    this.apiService.getAmplitudeInstance('cws_draw_scroll', moreVideoObj);
  }

}
