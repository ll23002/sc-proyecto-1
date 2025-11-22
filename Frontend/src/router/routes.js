const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'cargar-datos', component: () => import('pages/LoadDataPage.vue') },
      { path: 'transacciones', component: () => import('pages/TransactionsPage.vue') },
      { path: 'validar', component: () => import('pages/BalancePage.vue') },
      { path: 'reportes', component: () => import('pages/ReportsPage.vue') },
      { path: 'newPage', component: () => import('pages/newPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
