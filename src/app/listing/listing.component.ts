import { Component, ViewChild, ChangeDetectorRef, OnInit, AfterViewInit, Type, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { SharedComponent } from '../shared/shared.component';
import { ApiService } from './../shared/others/api.service';
import { ActivatedRoute } from '@angular/router';
import { Constants } from '../shared/others/constants';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss'],
  entryComponents: [ SharedComponent ],
})

export class ListingComponent implements OnInit, AfterViewInit {
  @ViewChild('container', {read: ViewContainerRef, static: false}) container: ViewContainerRef;
  
  // Keep track of list of generated components for removal purposes
  components = [];
  
  constructor(private cd: ChangeDetectorRef, private apiService: ApiService, private route: ActivatedRoute, private componentFactoryResolver: ComponentFactoryResolver) {}

  ngOnInit() {}

   // after init code
   ngAfterViewInit(): void {
    this.getComponentSequence();
  }

   // get the component sequence and home details
    // get the component sequence and home details
  getComponentSequence(){
    let url = Constants.url.getHomePageDetails;
    this.apiService.getApiData(url).subscribe(response =>{
      if(response)
      {
        response['data'].forEach(item=> {
          if(item == 'artists')
            this.addComponent(SharedComponent);
          else if (item == 'stageOriginals')
            this.addComponent(ListingComponent);
        })

      }
    })
  }

  // add components
  addComponent(componentClass: Type<any>) {
    // Create component dynamically inside the ng-template
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(componentClass);
    const component = this.container.createComponent(componentFactory);

    // Push the component so that we can keep track of which components are created
    this.components.push(component);
  }

  // post request sample api call 
  postSampleData(){
    let url = Constants.url.generateOTP;

    let reqData = {
      firstName: "Test",
      isNumChanged: false,
      mobNumber: "+911111111111"
    }
    this.apiService.getPostData(url, reqData).subscribe();
  }
}
