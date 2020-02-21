import { Component, OnInit, Input, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { Constants } from '../others/constants';
import { environment } from './../../../environments/environment';
import { faShareAlt } from '@fortawesome/free-solid-svg-icons';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../shared/others/api.service';


@Component({
  selector: 'app-episode-card',
  templateUrl: './episode-card.component.html',
  styleUrls: ['./episode-card.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class EpisodeCardComponent implements OnInit {
  faShareAlt = faShareAlt;
  public constantImg:any;
  lang;

  amplitudeObj = {
    User_ID: 'null', 
    TIMESTAMP: ''
  }

  amplitudeCollDurationObj = {
    User_ID: 'null', 
    TIMESTAMP: ''
  }

  amplitudeShareObj = {
    User_ID: 'null', 
    TIMESTAMP: ''
  }

  amplitudeViewCountObj = {
    User_ID: 'null', 
    TIMESTAMP: ''
  }

  // routerSlug:string=null;

  private ngNavigatorShareService: NgNavigatorShareService;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    ngNavigatorShareService: NgNavigatorShareService,
    private apiService: ApiService
  ) {
    this.constantImg = Constants.image;
    this.ngNavigatorShareService = ngNavigatorShareService;
  }


  @Input() episodeDetailObj;
  @Input() episodeDetailS3Url;
  @Input() searchKeyword;

  ngOnInit() {
    this.lang = this.route.snapshot.data.lang;
  }

  @Output() clickInfo = new EventEmitter<{show: boolean, id: string}>();
  @Output() actionInfo = new EventEmitter<boolean>();

  openInfoWindow(show: boolean, id: string) { 
    if( this.route.snapshot.routeConfig.path== 'collection-details/:slug') {
      // Amplitude Code
      this.apiService.getAmplitudeInstance('cdp_info', {'ARTIST_ID': this.episodeDetailObj.artistList[0]['id'], 'ARTIST_NAME': this.episodeDetailObj.artistList[0]['name'], 'COLLECTION_ID': this.episodeDetailObj['collectionId'], 'INFO_EPISODE_ID': this.episodeDetailObj['_id'], 'COLLECTION_NAME': this.episodeDetailObj['title']});
    }
    if( this.route.snapshot.routeConfig.path== 'show-details/:slug') {
      // Amplitude Code
      this.amplitudeObj['EPISODE_ID'] = this.episodeDetailObj['_id'];
      this.amplitudeObj['VIDEO_ID'] = this.episodeDetailObj['hlsSourceLink']
      this.amplitudeObj['VIDEO_DURATION'] = this.episodeDetailObj['duration'];
      this.apiService.getAmplitudeInstance('sdp_info_click', this.amplitudeObj);
    }
    if( this.route.snapshot.routeConfig.path== 'artist-landscape/:slug') {
        this.amplitudeViewCountObj['ARTIST_ID'] = this.episodeDetailObj.artistList[0]['id'];
        this.amplitudeViewCountObj['VIDEO_ID'] = this.episodeDetailObj['hlsSourceLink']
        this.amplitudeViewCountObj['VIEW_COUNT'] = this.episodeDetailObj['viewCount']
        this.amplitudeViewCountObj['VIDEO_DURATION'] = this.apiService.convertVideoTimeFormat(this.episodeDetailObj['duration']);
        this.apiService.getAmplitudeInstance('aldp_info', this.amplitudeViewCountObj);
    }
    if( this.route.snapshot.routeConfig.path== 'search') {
      this.apiService.getAmplitudeInstance('search_videoinfo', {'ARTIST_ID': this.episodeDetailObj.artistList[0]['id'], 'VIDEO_ID': this.episodeDetailObj['hlsSourceLink']});
    }
    
    this.clickInfo.emit({ show: show, id: id });
    $('body').addClass('noscroll');
  }
  
  openActionWindow(show: boolean) {
    this.actionInfo.emit(show);
  }

  redirectToConsumption(){
    // Amplitude Code
    if( this.route.snapshot.routeConfig.path== 'collection-details/:slug') {
      // Amplitude Code
      this.amplitudeCollDurationObj['EPISODE_ID'] = this.episodeDetailObj['_id'];
      this.amplitudeCollDurationObj['VIDEO_DURATION'] = this.apiService.convertVideoTimeFormat(this.episodeDetailObj['duration']);
      this.apiService.getAmplitudeInstance('cdp_episode_click ', this.amplitudeCollDurationObj);
    }
    if( this.route.snapshot.routeConfig.path.includes('show-details/')) {
      this.apiService.getAmplitudeInstance('sdp_episode_click', {'EPISODE_ID': this.episodeDetailObj['_id'], 'VIDEO_ID': this.episodeDetailObj['hlsSourceLink'], 'VIDEO_DURATION': this.apiService.convertVideoTimeFormat(this.episodeDetailObj['duration']), 'SHOW_ID': this.episodeDetailObj['showId']});
    }
    if( this.route.snapshot.routeConfig.path== 'artist-landscape/:slug') {
      this.amplitudeViewCountObj['ARTIST_ID'] = this.episodeDetailObj.artistList[0]['id'];
      this.amplitudeViewCountObj['VIDEO_ID'] = this.episodeDetailObj['hlsSourceLink'];
      this.amplitudeViewCountObj['VIEW_COUNT'] = this.episodeDetailObj['viewCount'];
      this.amplitudeViewCountObj['VIDEO_DURATION'] = this.apiService.convertVideoTimeFormat(this.episodeDetailObj['duration']);
      this.apiService.getAmplitudeInstance('aldp_videoclick', this.amplitudeViewCountObj);
    }
    if( this.route.snapshot.routeConfig.path== 'search') {
      this.apiService.getAmplitudeInstance('search_videoclick', {'ARTIST_ID': this.episodeDetailObj.artistList[0]['id'], 'VIDEO_ID': this.episodeDetailObj['hlsSourceLink']});
    }

    if(!!this.episodeDetailObj['seasonId'])
      this.router.navigate(['full-consumption'], { queryParams: {type: 'show', slug: this.episodeDetailObj['showSlug'], seasonSlug: this.episodeDetailObj['seasonSlug'], episodeSlug: this.episodeDetailObj['slug']} });
    else if(!!this.episodeDetailObj['collectionId'])
      this.router.navigate(['full-consumption'], { queryParams: {type: 'collection', slug: this.episodeDetailObj['collectionSlug'], detailSlug: this.episodeDetailObj['slug'], count: this.episodeDetailObj['episodeCount']} });
    else
    {
      if(this.searchKeyword!=null || this.searchKeyword!='')
        this.router.navigate(['feed-consumption'], { queryParams: { type: 'episode', keyword: this.searchKeyword, episodeSlug: this.episodeDetailObj['slug']} });
      else
        this.router.navigate(['feed-consumption'], { queryParams: {type: 'episode', episodeSlug: this.episodeDetailObj['slug'] } });
    }
  }

  async nativeShare(episodeDetail) {
    try {
      var url = '';
      if (episodeDetail.showId !== undefined && episodeDetail.showId !== 0){
        url = environment.domainUrl + "full-consumption?type=show&slug=" + episodeDetail.showSlug + "&seasonSlug=" + episodeDetail.seasonSlug + "&episodeSlug=" + episodeDetail.slug;
      } else if (episodeDetail.collectionId !== undefined && episodeDetail.collectionId !== 0) {
        url = environment.domainUrl + "full-consumption?type=collection&slug=" + this.episodeDetailObj['collectionSlug'] + "&detailSlug=" + episodeDetail.slug;
      } else {
        if(this.searchKeyword==null || this.searchKeyword=='')
          url = environment.domainUrl +  "feed-consumption?type=episode&keyword=" + this.searchKeyword;
        else
          url = environment.domainUrl +  "feed-consumption?type=episode&episodeSlug=" + this.episodeDetailObj['slug'];
      }
      // Amplitude Code for Share
      if( this.route.snapshot.routeConfig.path == 'artist-landscape/:slug') {
        // Amplitude Code
        this.amplitudeShareObj['ARTIST_ID'] = this.episodeDetailObj.artistList[0]['id'];
        this.amplitudeShareObj['VIDEO_ID'] = this.episodeDetailObj['hlsSourceLink']
        this.amplitudeShareObj['VIDEO_DURATION'] = this.apiService.convertVideoTimeFormat(this.episodeDetailObj['duration']);
        this.apiService.getAmplitudeInstance('aldp_share', this.amplitudeShareObj);
      }

      if( this.route.snapshot.routeConfig.path== 'search') {
        this.apiService.getAmplitudeInstance('search_videoshare', {'ARTIST_ID': this.episodeDetailObj.artistList[0]['id'], 'VIDEO_ID': this.episodeDetailObj['hlsSourceLink']});
      }
      
      if(this.lang['langauge']=='en')
        var mess = "Hey, I came across some amazing content on Stage App and wanted to share it with you! \n\n" + episodeDetail.title + " - " + url + "\n\n" + "Get the App now, " + environment.appUrl + " , and discover great comedy, poetry, and storytelling content on Stage!";
      else
        var mess = "हैलो, मैंने स्टेज ऐप पर एक बहुत दिलजस्प और मनोरंजक वीडियो देखा।\n\n" + episodeDetail.title + "\n\n" + url + "\n\n" + "ऐप डाउनलोड करे और कॉमेडी, पोएट्री, तथा स्टोरीटेलिंग के जगत की विशेष वीडियोस का आनंद उठाये । " + "\n\n" + environment.appUrl;

      await this.ngNavigatorShareService.share({
        title: '', text: mess
      });
    } catch (error) { }
  }

}
