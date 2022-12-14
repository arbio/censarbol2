import { route } from 'quasar/wrappers'

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/list', component: () => import('src/pages/List.vue') },
      { path: '/tree/:treeId?', component: () => import('pages/TreeForm.vue'), props: true },
      { path: '/export', component: () => import('pages/Export.vue'), props: true }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
