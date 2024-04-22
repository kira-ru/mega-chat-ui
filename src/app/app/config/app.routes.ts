import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'chat',
    loadComponent: () => import('@pages/layout/layout.component').then((c) => c.LayoutComponent),
    title: `TAB 1`,
    children: [
      {
        path: '',
        loadComponent: () => import('@pages/chat/chat.component').then((c) => c.ChatComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'chat',
  },
];
