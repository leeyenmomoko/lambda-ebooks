console.log('main');
import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import Nav from './Nav.vue'
import List from './List.vue'
import Signin from './Signin.vue'

// register modal component
Vue.component('modal', {
  template: '#modal-template'
})

const routes = [
  { path: '/', component: List },
  { path: '/signin', component: Signin }
]
const router = new VueRouter({
  routes
})
const app = new Vue({
  router,
  components: { "app-nav": Nav},
  data: {
    message: 'Hello world!'
  }
}).$mount('#app');
