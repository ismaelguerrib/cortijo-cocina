import { Routes } from '@angular/router';
import { CalendarPageComponent } from './features/calendar/calendar-page.component';
import { RecipesPageComponent } from './features/recipes/recipes-page.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'calendrier'
  },
  {
    path: 'calendrier',
    component: CalendarPageComponent
  },
  {
    path: 'recettes',
    component: RecipesPageComponent
  }
];
