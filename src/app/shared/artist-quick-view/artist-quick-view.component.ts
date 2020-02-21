import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faPlayCircle, faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../../shared/others/api.service';
import { Constants } from '../../shared/others/constants';

@Component({
  selector: 'app-artist-quick-view',
  templateUrl: './artist-quick-view.component.html',
  styleUrls: ['./artist-quick-view.component.scss', '../../artist-landscape/artist-landscape.component.scss']
})
export class ArtistQuickViewComponent implements OnInit {
  
  faPlayCircle = faPlayCircle;
  faAngleRight = faAngleRight;
  lang;

  @Input() artistId;

  artistDetail={
    s3Url:null,
    data:null
  }

  constructor(private apiService: ApiService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.lang = this.route.snapshot.data.lang;
    this.getArtistDetail();
  }

  // get show original listing with details 
  getArtistDetail(){
    let url = Constants.url.getArtistDetail+'?artistId='+this.artistId;
    this.apiService.getApiData(url).subscribe(response =>{
      if(response['responseCode'] == 200)
      {
        this.artistDetail.s3Url = response['data']['s3Url'];
        this.artistDetail.data = response['data']['artistDetail'];     
      }
    })
  }

  artistQuickView() {
    $('body').removeClass('noscroll');
  }

  onArtistLandQuick(id, name) {
    // Amplitude Code
    this.apiService.getAmplitudeInstance('artistquickview_landscape', {'ARTIST_ID': id, 'ARTIST_NAME': name});
    $('body').removeClass('noscroll');
  }

}
