import { Component, OnInit, Input } from '@angular/core';
import { Constants } from '../../shared/others/constants';

@Component({
  selector: 'app-artist-small-card',
  templateUrl: './artist-small-card.component.html',
  styleUrls: ['./artist-small-card.component.scss']
})
export class ArtistSmallCardComponent implements OnInit {

  public constantImg:any;
  @Input() artistSmallObj;
  @Input() artistSmallS3Url;

  constructor() {
    this.constantImg = Constants.image;
  }

  ngOnInit() {}
}
