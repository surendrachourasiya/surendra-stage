import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Constants } from '../others/constants';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-quick-view-card',
  templateUrl: './quick-view-card.component.html',
  styleUrls: ['./quick-view-card.component.scss']
})
export class QuickViewCardComponent implements OnInit {

  public constantImg:any;
  lang;
  
  constructor(private router: Router, private route: ActivatedRoute) { 
    this.constantImg = Constants.image;
  }

  @Input() quickViewIndex;
  @Input() quickViewObj;
  @Input() quickViewS3Url;
  @Input() searchKeyword;
  @Output() closeQuickView= new EventEmitter<boolean>();;

  ngOnInit() {
    this.lang = this.route.snapshot.data.lang;
  }

  redirectToConsumption(){
    $('body').removeClass('noscroll'); 

    if(this.router.url.indexOf('/feed-consumption') > -1)
    {
      if(this.quickViewIndex != 1)
        this.redirectToFeedConsumption();
      
      this.closeQuickView.emit(false);
      window.scrollTo(0,0);
    }
    else
    {
      if(!!this.quickViewObj['seasonId'])
        this.router.navigate(['full-consumption'], { queryParams: {type: 'show', slug: this.quickViewObj['showSlug'], seasonSlug: this.quickViewObj['seasonSlug'], episodeSlug: this.quickViewObj['slug']} });
      else if(!!this.quickViewObj['collectionId'])
        this.router.navigate(['full-consumption'], { queryParams: {type: 'collection', slug: this.quickViewObj['collectionSlug'], detailSlug: this.quickViewObj['slug'], count: this.quickViewObj['episodeCount']} });
      else
        this.redirectToFeedConsumption();
    }
  }

  redirectToFeedConsumption(){
    if(!(this.searchKeyword==null || this.searchKeyword==''))
          this.router.navigate(['feed-consumption'], { queryParams: {type: 'episode', keyword: this.searchKeyword } });
    else
      this.router.navigate(['feed-consumption'], { queryParams: {type: 'episode', episodeSlug: this.quickViewObj['slug']} });
  }

}
