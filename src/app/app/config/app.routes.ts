import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@pages/layout/layout.component').then((c) => c.LayoutComponent),
    children: [
      {
        path: 'chat',
        loadComponent: () => import('@pages/chat/chat.component').then((c) => c.ChatComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'chat',
    title: 'Tab 1',
  },
];
