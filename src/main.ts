import { createApp } from 'vue'
import router from './router'
import store from './store'
import App from './App.vue'
import axios from 'axios'

axios.defaults.baseURL = 'http://apis.imooc.com/api/'
// 请求之前，设置参数icode, loading = true
axios.interceptors.request.use(config => {
  // 发送请求前，设置error = false
  store.commit('setError', { status: false, message: '' })
  // method = get 时
  config.params = { ...config.params, icode: '8720673DAD76D867' }
  // 上传文件时
  if (config.data instanceof FormData) {
    config.data.append('icode', '8720673DAD76D867')
  } else { // method = post 时
    config.data = { ...config.data, icode: '8720673DAD76D867' }
  }
  store.commit('setLoading', true)
  return config
})
// 请求成功之后，设置loading = false
axios.interceptors.response.use(config => {
  setTimeout(() => {
    store.commit('setLoading', false)
  }, 1000)
  return config
}, e => { // 请求失败 （VueX 官方文档）
  console.log(e.response)
  // 当出现错误时，获取错误信息
  const { error } = e.response.data
  // 改变 error = true
  store.commit('setError', { status: true, message: error })
  // 改变 loading = false
  store.commit('setLoading', false)
  return Promise.reject(error)
})

// axios.get('columns', { params: { key: 'hello' } }).then(resp => {
//   console.log(resp.data)
// })
const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')
