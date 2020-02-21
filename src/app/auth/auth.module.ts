import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth.component';
import { Routes, RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { SocialLoginModule, AuthServiceConfig , FacebookLoginProvider,  GoogleLoginProvider} from 'angularx-social-login';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CountdownModule , CountdownGlobalConfig} from 'ngx-countdown';
import { NgxSpinnerModule } from 'ngx-spinner';
// 836043892110-llsvtar7t762glrfhi41mce2cnv29lks.apps.googleusercontent.com
let config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider('836043892110-llsvtar7t762glrfhi41mce2cnv29lks.apps.googleusercontent.com')
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider('2515529451818509')
  }
]);

export function provideConfig() {
  return config;
}

// function countdownConfigFactory(): CountdownGlobalConfig {
//   return { format: `mm:ss` };
  
// }

const authDetailRoute: Routes = [];

@NgModule({
  declarations: [AuthComponent],
  imports: [
    CommonModule,
    RouterModule.forRoot(authDetailRoute),
    SharedModule,
    SocialLoginModule,
    FormsModule,
    ReactiveFormsModule,
    CountdownModule,
    NgxSpinnerModule
    // FontAwesomeModule
  ],
  providers: [
    {
    provide: AuthServiceConfig,
    useFactory: provideConfig
  },
  // { provide: CountdownGlobalConfig, useFactory: countdownConfigFactory }

]
})
export class AuthModule { }




