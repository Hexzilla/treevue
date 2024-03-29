import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: () => import('@/views/dashboard/Index'),
      children: [
        // Dashboard
        {
          name: 'Dashboard',
          path: '',
          component: () => import('@/views/dashboard/Dashboard'),
        },
        // Pages
        {
          name: 'Client List',
          path: 'pages/client',
          component: () => import('@/views/dashboard/pages/ClientList'),
        },
        {
          name: 'Country List',
          path: 'pages/country',
          component: () => import('@/views/dashboard/pages/CountryList'),
        },
        {
          name: 'Designation',
          path: 'pages/designation',
          component: () => import('@/views/dashboard/pages/Designation'),
        },
        {
          name: 'Role List',
          path: 'pages/role',
          component: () => import('@/views/dashboard/pages/RoleList'),
        },
        {
          name: 'Task List',
          path: 'pages/task',
          component: () => import('@/views/dashboard/pages/TaskList'),
        },
        {
          name: 'Project List',
          path: 'pages/project',
          component: () => import('@/views/dashboard/pages/Projects'),
        },
        {
          name: 'User Profile',
          path: 'pages/user',
          component: () => import('@/views/dashboard/pages/UserProfile'),
        },
        {
          name: 'Notifications',
          path: 'components/notifications',
          component: () => import('@/views/dashboard/component/Notifications'),
        },
        {
          name: 'Icons',
          path: 'components/icons',
          component: () => import('@/views/dashboard/component/Icons'),
        },
        {
          name: 'Typography',
          path: 'components/typography',
          component: () => import('@/views/dashboard/component/Typography'),
        },
        // // Tables
        // {
        //   name: 'Regular Tables',
        //   path: 'tables/regular-tables',
        //   component: () => import('@/views/dashboard/tables/RegularTables'),
        // },
        // // Maps
        // {
        //   name: 'Google Maps',
        //   path: 'maps/google-maps',
        //   component: () => import('@/views/dashboard/maps/GoogleMaps'),
        // },
        // Upgrade
        // {
        //   name: 'Upgrade',
        //   path: 'upgrade',
        //   component: () => import('@/views/dashboard/Upgrade'),
        // },
      ],
    },
  ],
})
