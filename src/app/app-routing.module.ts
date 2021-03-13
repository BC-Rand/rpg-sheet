import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SheetComponent } from './sheet/sheet.component';
import { ClassComponent } from './class/class.component';
import { RaceComponent } from './race/race.component';
import { BackgroundComponent } from './background/background.component';
import { AbilitiesComponent } from './abilities/abilities.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'create/class',
    pathMatch: 'full'
  },
  {
    path:'sheet',
    component: SheetComponent
  },
  {
    path:'create',
    redirectTo: 'create/class',
    pathMatch: 'full'
  },
  {
    path:'create/class',
    component: ClassComponent,
  },
  {
    path:'create/race',
    component: RaceComponent,
  },
  {
    path:'create/background',
    component: BackgroundComponent,
  },
  {
    path:'create/abilities',
    component: AbilitiesComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
