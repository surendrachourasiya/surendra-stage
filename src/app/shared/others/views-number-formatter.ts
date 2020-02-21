import { Pipe, PipeTransform } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Pipe({
  name: 'viewsNumberFormatter'
})
export class viewsNumberFormatter implements PipeTransform {

  constructor(private route: ActivatedRoute) { }

  transform(input: any, args?: any): any {
    
    var exp, rounded,
      suffixes = ['K', 'M', 'G', 'T', 'P', 'E'];

    if (!input) {
      return 0 +' '+this.route.snapshot.data.lang.home.common.viewSingular;
    }
   
    if (input > 1 && input < 1000) {
      return input +' '+this.route.snapshot.data.lang.home.common.viewPlural;
    }

    if (input <= 1){
      return input +' '+this.route.snapshot.data.lang.home.common.viewSingular;
    }    

    exp = Math.floor(Math.log(input) / Math.log(1000));

    return (input / Math.pow(1000, exp)).toFixed(args) + suffixes[exp - 1] +' '+this.route.snapshot.data.lang.home.common.viewPlural;

  }

}