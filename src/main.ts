import { createApp } from 'vue'
import router from './router'
import store from './store'
import App from './App.vue'
import axios from 'axios'

axios.defaults.baseURL = 'http://apis.imooc.com/api/'
// 请求之前，设置参数icode, loading = true
axios.interceptors.request.use(config => {
  if (config.method === 'get') {
    config.params = { ...config.params, icode: '8720673DAD76D867' }
  } else if (config.data instanceof FormData) {
    config.data.append('icode', '8720673DAD76D867')
  } else {
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
})

// axios.get('columns', { params: { key: 'hello' } }).then(resp => {
//   console.log(resp.data)
// })
const app = createApp(App)
app.use(router)
app.use(store)
app.mount('#app')
