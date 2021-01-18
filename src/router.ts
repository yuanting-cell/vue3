import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import store from './store'
import ColumnDetail from './views/ColumnDetail.vue'
import CreatePost from './views/CreatePost.vue'
import PostDetail from './views/PostDetail.vue'
import Signup from './views/Signup.vue'
import axios from 'axios'
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
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup,
      meta: { redirectAlreadyLogin: true }
    }
  ]
})
// 导航守卫——前置守卫
router.beforeEach((to, from, next) => {
  // console.log(to.meta)
  const { user, token } = store.state
  const { requiredLogin, redirectAlreadyLogin } = to.meta
  if (!user.isLogin) { // 尚未登陆，
    if (token) { // 有 token,则将token 添加进头部发送请求
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
      store.dispatch('fetchCurrentUser').then(() => { // 请求成功之后，判断是否有 redirectAlreadyLogin = true， 若有，则跳转首页，若没有，则继续跳转
        if (redirectAlreadyLogin) {
          next('/')
        } else {
          next()
        }
      }).catch(e => {
        console.error(e)
        // 请求失败时，删除token缓存
        store.commit('logout')
        next('login')
      })
    } else { // 没有token ,判断是否有 requiredLogin = true, 若有，则跳转登录页面， 如没有，则继续跳转
      if (requiredLogin) {
        next('login')
      } else {
        next()
      }
    }
  } else { // 已经登陆,如果有 redirectAlreadyLogin = true,则跳转首页，否则就继续跳转
    if (redirectAlreadyLogin) {
      next('/')
    } else {
      next()
    }
  }
  // if (to.meta.requiredLogin && !store.state.user.isLogin) {
  //   next({ name: 'login' })
  // } else if (to.meta.redirectAlreadyLogin && store.state.user.isLogin) {
  //   next('/')
  // } else {
  //   next()
  // }
})
export default router
