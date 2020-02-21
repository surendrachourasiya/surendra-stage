// /app/atatus.handler.ts
import { ErrorHandler } from '@angular/core';
import * as atatus from 'atatus-spa';
atatus.config('6c25571e9ddd42628bb51ef484e8571d').install();

export class AtatusErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    if (atatus) {
      // Send the error to Atatus
      atatus.notify(error.originalError || error);
    }
  }
}
