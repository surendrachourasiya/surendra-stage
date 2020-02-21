import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute , Router} from '@angular/router';
import { Constants } from '../others/constants';
import { ApiService } from './../../shared/others/api.service';
@Component({
  selector: 'app-stage-collection-list',
  templateUrl: './stage-collection-list.component.html',
  styleUrls: ['./stage-collection-list.component.scss']
})
export class StageCollectionListComponent implements OnInit {

  public constantImg:any;
 
  constructor(private router: Router, private route: ActivatedRoute, private apiService: ApiService) { 
    this.constantImg = Constants.image;
  }

  @Input() collectionDetailObj;
  @Input() collectionDetailS3Url;
  @Input() collectionEpisodeList;
  
  artistArrText:string = '';
  iscollList:boolean = false;
  lang;

  ngOnInit() {
    this.lang = this.route.snapshot.data.lang;
    this.getArtistArrayLength();    
  }

  fullConsumptionCollection(collectionSlug,episodeSlug,episodeCount) {
   
   history.pushState({urlPath:'/collection-details'},"history","collection-details/"+collectionSlug)
   this.router.navigateByUrl('/full-consumption?type=collection&slug='+collectionSlug+'&detailSlug='+episodeSlug+'&count='+episodeCount);
  }

  getArtistArrayLength(){
    let arrLength = this.collectionDetailObj.artistList.length;
    if( arrLength > 3)
    {
      let label = this.route.snapshot.data.lang.home.common.andMoreLabel;
      this.artistArrText=label.replace('##count##', arrLength-3);
    }
  }

  toggleArrow(){
    this.iscollList = !this.iscollList;
    let artist_ids = this.collectionDetailObj['artistList'].map(artistId => artistId.id);
    this.apiService.getAmplitudeInstance('collectionshow_seecollection', {'COLLECTION_ID': this.collectionDetailObj['_id'], 'COLLECTION_NAME': this.collectionDetailObj['title'], 'ARTIST_IDs': artist_ids});
  }

  // Amplitude Code
  getColletionObj(tab, id) {

    let artist_ids = this.collectionDetailObj['artistList'].map(artistId => artistId.id);
    if(tab == 'thumbnail'){
      this.apiService.getAmplitudeInstance('collectionshow_thumb_click', {'COLLECTION_ID': this.collectionDetailObj['_id'], 'COLLECTION_NAME': this.collectionDetailObj['title'], 'ARTIST_IDs': artist_ids});
    }
    if(tab == 'see_all'){
      this.apiService.getAmplitudeInstance('collectionshow_seeallvid', {'COLLECTION_ID': this.collectionDetailObj['_id'], 'COLLECTION_NAME': this.collectionDetailObj['title'], 'ARTIST_IDs': artist_ids});
    }
    if(tab == 'collection_play'){
      this.apiService.getAmplitudeInstance('collectionshow_play', {'COLLECTION_ID': this.collectionDetailObj['_id'], 'COLLECTION_NAME': this.collectionDetailObj['title'], 'PLAYED_CONTENT_ID': id});
    }
  }

}
