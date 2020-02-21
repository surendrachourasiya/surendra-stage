import { Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Pipe({
  name: 'playBtnTextFormatter'
})
export class playBtnTextFormatter implements PipeTransform {

  constructor(private route: ActivatedRoute) { }

  transform(input: any): any {
    if(!input)
      return '';

    if (this.route.snapshot.data.lang['langauge']=='en') {
      return this.route.snapshot.data.lang.home.common.discoverButton+' '+input;
    }
    return input+' '+this.route.snapshot.data.lang.home.common.discoverButton;
  }

}