import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { Constants } from '../others/constants';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../others/api.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})

export class ToastComponent implements OnInit, OnChanges {

  @Input() snackbarData: any = false;
  @Output() closeSnackbar = new EventEmitter<void>();
  currentLang:string;

  constantsMsg={};

  constructor(private route: ActivatedRoute, private apiService: ApiService) { 
    this.currentLang = this.apiService.getCurrentLanguage();
    this.constantsMsg= Constants.msg[this.currentLang];
  }

  ngOnInit() {
    this.setSnackbarCloseTimeout();
  }

  ngOnChanges(){
    this.setSnackbarCloseTimeout();
  }

  setSnackbarCloseTimeout(){
    if(this.snackbarData.autoHide)
    {
      setTimeout(() => {
        this.closeSnackbar.emit();
      }, 3000);
    }
  }

  closeSnakbar(){
    this.closeSnackbar.emit();
    // reload 
    if(this.snackbarData.actionText == 'retryText')
      location.reload();
  }
}
