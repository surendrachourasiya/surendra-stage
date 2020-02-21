import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Constants } from '../others/constants';
import { ApiService } from '../../shared/others/api.service';

@Component({
  selector: 'app-stage-original-card',
  templateUrl: './stage-original-card.component.html',
  styleUrls: ['./stage-original-card.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class StageOriginalCardComponent implements OnInit {

  public constantImg:any;
  
  constructor(private route: ActivatedRoute, private apiService: ApiService) { 
    this.constantImg = Constants.image;
  }
  
  @Input() stageOriginalObj;
  @Input() stageOriginalS3Url;
  @Input() screenType;

  artistArrText:string = '';
  lang;

  ngOnInit() {
    this.lang = this.route.snapshot.data.lang;
    this.getArtistArrayLength();
  }

  getArtistArrayLength(){
    let arrLength = this.stageOriginalObj.artistList.length;
    if( arrLength > 3)
    {
      let label = this.route.snapshot.data.lang.home.common.andMoreLabel;
      this.artistArrText=label.replace('##count##', arrLength-3);
    }
  }

  onShowClicked() {
    var artist_ids = this.stageOriginalObj['artistList'].map(artistId => artistId.id);
    if(this.screenType == 'show-details') {
      this.apiService.getAmplitudeInstance('sdp_show_click', {'ARTIST_IDs' : artist_ids, 'SHOW_ID' : this.stageOriginalObj['_id']});
    }
  }

}
