import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable()
export class Resolver implements Resolve<Observable<string>> {
    constructor(
        private api: ApiService
    ) { }

    resolve() {
        return this.api.getLanguageText();
    }
}