import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import store from './store'
import ColumnDetail from './views/ColumnDetail.vue'
import CreatePost from './views/CreatePost.vue'
import PostDetail from './views/PostDetail.vue'
const routeeHistory = createWebHistory()
const router = createRouter({
  history: routeeHistory,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { redirectAlreadyLogin: true }
    },
    {
      path: '/column/:id',
      name: 'column',
      component: ColumnDetail
    },
    {
      path: '/create',
      name: 'create',
      component: CreatePost,
      meta: { requiredLogin: true }
    },
    {
      path: '/posts/:id',
      name: 'post',
      component: PostDetail
    }
  ]
})
// 导航守卫——前置守卫
router.beforeEach((to, from, next) => {
  console.log(to.meta)
  // console.log('to', to)
  // console.log('from', from)
  // 1.如果下一个页面有requiredLogin=true，且用户尚未登陆，则直接跳转到登录页面; 否则直接跳转下一个页面 (要求登录才能访问，但用户却没有登录)
  // 2.如果该页面要求已经登陆，且用户已经登录，则跳转首页
  if (to.meta.requiredLogin && !store.state.user.isLogin) {
    next({ name: 'login' })
  } else if (to.meta.redirectAlreadyLogin && store.state.user.isLogin) {
    next('/')
  } else {
    next()
  }
})
export default router
