import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { faShareAlt } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../others/api.service';
import { Router, ActivatedRoute } from "@angular/router";
import { Location } from "@angular/common";
import { environment } from 'src/environments/environment';
import { NgNavigatorShareService } from 'ng-navigator-share';

@Component({
  selector: 'app-action-overflow-menu',
  templateUrl: './action-overflow-menu.component.html',
  styleUrls: ['./action-overflow-menu.component.scss']
})
export class ActionOverflowMenuComponent implements OnInit {

  faShareAlt = faShareAlt;
  route: string;

  amplitudeObj = {
    User_ID: 'null', 
    TIMESTAMP: ''
  }

  @Output() actionDisable = new EventEmitter<boolean>();
  @Input() detail: any;
  lang;
  @Input() screen_type: any;
  @Input() collectionObj: any;
  @Input() artistDetail: any;

  private ngNavigatorShareService: NgNavigatorShareService;
  constructor(private apiService: ApiService, private location: Location, private router: Router, private activatedRoute: ActivatedRoute, ngNavigatorShareService: NgNavigatorShareService,) { 
    this.ngNavigatorShareService = ngNavigatorShareService;
  }

  ngOnInit() { 
    this.lang = this.activatedRoute.snapshot.data.lang;
  }

  toggleActionPanel(value: boolean) {
    // service event emit for header in detail page
    this.apiService.closePopup(false);

    // event emit for consumption
    this.actionDisable.emit(value);
    $('body').removeClass('scroll-hide');
    $('body').removeClass('noscroll');
  }  


  // copy url to clipboard
  copyLinkToClipboard(){
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = window.location.href;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);

    // hide the action panel
    this.actionDisable.emit(false);
  }

  async enableShareOption() {
    try {
      if(this.screen_type == 'feed-cunsumption') {
        // Amplitude Code
        var obj = {'ARTIST_ID' : this.artistDetail.artistList[0]['id'], 'VIDEO_ID' :  this.artistDetail['hlsSourceLink'],
        'VIDEO_DURATION' :  this.apiService.convertVideoTimeFormat(this.artistDetail['duration']),
        'VIDEO_CONSUMED' : this.apiService.convertVideoTimeFormat(this.artistDetail['lapseTime'])};
        this.apiService.getAmplitudeInstance('fcs_share', obj);
      }

      if(this.screen_type == 'show-details') {
        // Amplitude Code
        this.amplitudeObj['EPISODE_ID'] = this.detail['_id'];
        this.amplitudeObj['VIDEO_ID'] = this.detail.selectedPeripheral['hlsSourceLink']
        this.amplitudeObj['VIDEO_DURATION'] = this.detail.selectedPeripheral['duration'];
        this.apiService.getAmplitudeInstance('sdp_share', this.amplitudeObj);
      }
      
      var url = environment.sharedUrl + this.router.url;
      if (this.screen_type == 'artist_landscape'){

        if (this.lang['langauge'] == 'en')
          var mess = "Have you seen " + this.detail.firstName + ' ' + this.detail.lastName + " on the Stage App ? Watching their performance was a truly wonderful experience.\n A link to their profile is - " + url + "\n\nDownload the Stage app for exclusive and latest videos on Comedy, Poetry, and Storytelling.Enjoy!" + "\n\n" + environment.appUrl;
        else
          var mess = "क्या आपने स्टेज ऐप पर " + this.detail.firstName + ' ' + this.detail.lastName + " को देखा ? " + this.detail.firstName + " का परफॉरमेंस स्टेज पर देख कर मज़ा ही आ गया।\nमैंने उनके प्रोफाइल का लिंक यहाँ शेयर किया हैं - " + url + "\n\nस्टेज ऐप डाउनलोड करे और कॉमेडी, पोएट्री, तथा स्टोरीटेलिंग के जगत की विशेष वीडियोस का आनंद उठाये। " + "\n\n" + environment.appUrl;
      }else{
        if (!!this.detail['url'])
          url = environment.sharedUrl + '/' + this.detail['url'];

        if (this.lang['langauge'] == 'en')
          var mess = "Hey, I came across some amazing content on Stage App and wanted to share it with you! \n\n" + this.detail.title + " - " + url + "\n\n" + "Get the App now, " + environment.appUrl + " , and discover great comedy, poetry, and storytelling content on Stage!";
        else
          var mess = "हैलो, मैंने स्टेज ऐप पर एक बहुत दिलजस्प और मनोरंजक वीडियो देखा।\n\n" + this.detail.title + "\n\n" + url + "\n\n" + "ऐप डाउनलोड करे और कॉमेडी, पोएट्री, तथा स्टोरीटेलिंग के जगत की विशेष वीडियोस का आनंद उठाये । " + "\n\n" + environment.appUrl;

      }

      await this.ngNavigatorShareService.share({
        title: '', text: mess
      });
      
      this.toggleActionPanel(false);

      if(this.screen_type == 'consumption-card') {
        // Amplitude Code
        var consumptionShareObj = {
          "ARTIST_ID" : this.artistDetail['_id'], "ARTIST_NAME" : this.artistDetail['firstName'],
          "VIDEO_DURATION" : this.apiService.convertVideoTimeFormat(this.artistDetail['story']['duration']), "VIDEO_CONSUMED" : this.apiService.convertVideoTimeFormat(this.artistDetail['lapseTime']),
          "CONSUMED_PERCENT" : this.apiService.consumedPercent(this.artistDetail['story']['duration'], this.artistDetail['lapseTime']),
        }
        this.apiService.getAmplitudeInstance('artiststory_con_ellipses', consumptionShareObj);
      }
    } catch (error) { }
  }

}
