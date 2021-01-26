import Vue from 'vue'
import Router from 'vue-router'
import index from '@/components/index'
import createIntent from '@/components/createIntent'
import editIntent from '@/components/editIntent'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: index
    },
    {
      path: '/createIntent',
      name: 'createIntent',
      component: createIntent
    },
    {
      path: '/editIntent/:id',
      name: 'editIntent',
      component: editIntent
    },
  ]
})