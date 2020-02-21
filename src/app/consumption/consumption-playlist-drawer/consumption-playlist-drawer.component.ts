import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { Constants } from 'src/app/shared/others/constants';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../shared/others/api.service';

@Component({
  selector: 'app-consumption-playlist-drawer',
  templateUrl: './consumption-playlist-drawer.component.html',
  styleUrls: ['./consumption-playlist-drawer.component.scss']
})

export class ConsumptionPlaylistDrawerComponent implements OnInit {
  @Input() artistDrawerObj;
  @Input() artistDrawerS3Url;
  @Input() moreArtistDrawerObj;
  @Input() type;
  @Input() activeElementIndex;
  @Input() consumptionDetail;

  @Output() moveSelectedContent = new EventEmitter<number>();
  @Output() openCloseDrawer = new EventEmitter<boolean>();

  showListArr = {
    id : []
  }

  public constantImg: any;
  faAngleUp = faAngleUp;
  faAngleDown = faAngleDown;
  amplitudeArr = [];

  isSliderOn = false;
  isQuickviewVisible: boolean = false;
  lang;

  constructor(private route: ActivatedRoute, private apiService: ApiService) {
    this.constantImg = Constants.image;
  }
  
  ngOnInit() {
    this.lang = this.route.snapshot.data.lang;
  }
  
  changeVideo(event:number){
    this.moveSelectedContent.emit(event);
    this.isSliderOn = false;
  }

  // toggle event for quick view
  quickViewToggle(show: boolean) {
    this.isQuickviewVisible = show;
  }

  toggleslide() {
    if (this.isSliderOn == false && this.type == 'artist') {
      this.apiService.getAmplitudeInstance('artiststory_con_drawer', { 'ARTIST_ID': this.consumptionDetail['_id'], 'ARTIST_NAME': this.consumptionDetail['firstName'], 'VIDEO_DURATION': this.apiService.convertVideoTimeFormat(this.consumptionDetail.story['duration']), 'VIDEO_ID': this.consumptionDetail.story['hlsSourceLink'], 'VIDEO_CONSUMED': this.apiService.convertVideoTimeFormat(this.consumptionDetail['lapseTime']), 'VIDEO_FULLSCREEN': 0, "CONSUMED_PERCENT": this.apiService.consumedPercent(this.consumptionDetail.story['duration'], this.consumptionDetail['lapseTime']) });
    }
    this.isSliderOn = !this.isSliderOn;
    this.openCloseDrawer.emit(this.isSliderOn);
  }

  onMoreArtist() {
    this.apiService.getAmplitudeInstance('artiststory_con_drawmore', { 'ARTIST_ID': this.consumptionDetail['_id'], 'ARTIST_NAME': this.consumptionDetail['firstName'], 'VIDEO_DURATION': this.apiService.convertVideoTimeFormat(this.consumptionDetail.story['duration']), 'VIDEO_ID': this.consumptionDetail.story['hlsSourceLink'], 'VIDEO_CONSUMED': this.apiService.convertVideoTimeFormat(this.consumptionDetail['lapseTime']), "CONSUMED_PERCENT": this.apiService.consumedPercent(this.consumptionDetail.story['duration'], this.consumptionDetail['lapseTime']) });
  }

  moreVideoEvent(item_id, data) {
    this.amplitudeArr = [];
    data.forEach(item => {
      var id = item_id + item._id;
      // code to check element is in viewport - start
      if ($("#" + id).offset() != undefined) {
        var top_of_element = $("#" + id).offset().top;
        var left_of_element = $("#" + id).offset().left;
        var bottom_of_element = $("#" + id).offset().top + $("#" + id).outerHeight();
        var bottom_of_screen = $(window).scrollTop() + $(window).innerHeight();
        var top_of_screen = $(window).scrollTop();
        // code to check element is in viewport - end

        if (top_of_element >= 0 && left_of_element >= 0 && (bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)) {
          // the element is visible, do something
          this.amplitudeArr.push(item.story.hlsSourceLink);
        }
      }
    });
  }

  getViewPort(item_id, data) {
    this.showListArr.id = [];
    data.forEach(item=> {
      var id = item_id + item.id;
      // code to check element is in viewport - start
      if ($("#" + id).offset() != undefined) {
        // this.checkIfElementIsWithinViewport($("." + id));
        if ((id != undefined) && (id != null)) {
          var element_offets = this.checkIfElementIsWithinViewport($("#" + id));
          if (
            (element_offets.top >= 0) &&
            (element_offets.left >= 0) &&
            (element_offets.bottom <= window.innerHeight) &&
            (element_offets.right <= window.innerWidth)
          ) {
            if (item_id == 'similar_content_show_') {
              this.showListArr.id.push(item.hlsSourceLink);
            }
          } 
        }
          return false;
      }
    })
  }

  checkIfElementIsWithinViewport(element) {
    return element[0].getBoundingClientRect();
  }

  onScrollCard() {
    
    // console.log("hello")
    if (this.type == 'artist') {
      this.moreVideoEvent('similar_content_', this.artistDrawerObj);
      // this.getViewPort('similar_content_', this.artistDrawerObj);
      var moreVideoObj = {
        "ARTIST_ID": this.consumptionDetail._id, 'ARTIST_NAME': this.consumptionDetail.firstName, "VIDEO_DURATION": this.apiService.convertVideoTimeFormat(this.consumptionDetail.story.duration),
        "VIDEO_CONSUMED": this.apiService.convertVideoTimeFormat(this.consumptionDetail.lapseTime), "VIDEO_IDs": this.amplitudeArr,
        "CONSUMED_PERCENT": this.apiService.consumedPercent(this.consumptionDetail.story.duration, this.consumptionDetail.lapseTime)
      }

      this.apiService.getAmplitudeInstance('artiststory_con_drawscroll', moreVideoObj);
    }

    if (this.type == 'showPheripheral') {
      this.getViewPort('similar_content_show_', this.artistDrawerObj['mediaList']);
      let artist_names = this.artistDrawerObj['artistList'].map(artist => artist.name)
      var moreShowVideoObj = {'SHOW_ID': this.artistDrawerObj['_id'], 'SHOW_NAME': this.artistDrawerObj['title'], 'VIDEO_ID': this.showListArr.id,
                          'ARTIST_NAME': artist_names, "VIDEO_DURATION": this.apiService.convertVideoTimeFormat(this.artistDrawerObj['selectedPeripheral']['duration'])};
      this.apiService.getAmplitudeInstance('showintbuilder_scrolldrawer', moreShowVideoObj);
    }

  }

}
