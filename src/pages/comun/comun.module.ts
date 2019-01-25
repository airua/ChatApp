import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ComunPage } from './comun';

@NgModule({
  declarations: [
    ComunPage,
  ],
  imports: [
    IonicPageModule.forChild(ComunPage),
  ],
})
export class ComunPageModule {}
