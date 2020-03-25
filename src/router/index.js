import Vue from 'vue'
import Router from 'vue-router'
import TileGenerator from '@/components/TileGenerator'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'TileGenerator',
      component: TileGenerator
    }
  ]
})
