import { Component, OnInit, Input } from '@angular/core';
import { Constants } from '../others/constants';

@Component({
  selector: 'app-artist-card',
  templateUrl: './artist-card.component.html',
  styleUrls: ['./artist-card.component.scss']
})

export class ArtistCardComponent implements OnInit {

  public constantImg:any;
  @Input() artistObj;
  @Input() artistS3Url;
  @Input() artistBio;

  constructor() {
    this.constantImg = Constants.image;
  }

  ngOnInit() {}
}
