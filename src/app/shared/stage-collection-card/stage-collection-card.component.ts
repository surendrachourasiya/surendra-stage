import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Constants } from '../others/constants';

@Component({
  selector: 'app-stage-collection-card',
  templateUrl: './stage-collection-card.component.html',
  styleUrls: ['./stage-collection-card.component.scss']
})
export class StageCollectionCardComponent implements OnInit {

  public constantImg:any;

  constructor(private route: ActivatedRoute) { 
    this.constantImg = Constants.image;
  }

  @Input() stageCollectionObj;
  @Input() stageCollectionS3Url;
  
  artistArrText:string = '';
  lang;

  ngOnInit() {
    this.lang = this.route.snapshot.data.lang;
    this.getArtistArrayLength()
  }

  getArtistArrayLength(){    
    let arrLength = this.stageCollectionObj.artistList.length;
    if( arrLength > 3)
    {
      let label = this.route.snapshot.data.lang.home.common.andMoreLabel;
      this.artistArrText=label.replace('##count##', arrLength-3);
    }
  }

}
