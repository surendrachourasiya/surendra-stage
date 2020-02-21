import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-consumption',
  templateUrl: './consumption.component.html',
  styleUrls: ['./consumption.component.scss']
})

export class ConsumptionComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }

  artistId:null;

  ngOnInit() { 
    this.route.params.subscribe(params => {
      this.artistId = params['id'];
    });
  }
}
