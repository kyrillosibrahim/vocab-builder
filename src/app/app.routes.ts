import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'add',
    pathMatch: 'full',
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./features/add-word/add-word.component').then(m => m.AddWordComponent),
    title: 'Add Word - Vocab Builder',
  },
  {
    path: 'words',
    loadComponent: () =>
      import('./features/view-words/view-words.component').then(m => m.ViewWordsComponent),
    title: 'My Words - Vocab Builder',
  },
  {
    path: '**',
    redirectTo: 'add',
  },
];
