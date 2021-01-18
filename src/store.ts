import { createStore, Commit } from 'vuex'
import axios from 'axios'

// 用户信息数据
export interface UserProps {
  isLogin: boolean;
  nickName?: string;
  _id?: string;
  column?: string;
  email?: string;
  avatar?: ImageProps;
  description?: string;
}
// 请求返回的数据格式
export interface ResponseType<p = {}> {
  code: number;
  msg: string;
  data: p;
}
// 专栏图片数据类型
export interface ImageProps {
  _id?: string;
  url?: string;
  createAt?: string;
}
// 专栏列表数据
export interface ColumnProps {
  _id: string;
  title: string;
  avatar?: ImageProps;
  description: string;
}
// 文章列表数据
export interface PostProps {
  _id?: string;
  title: string;
  excerpt?: string;
  content?: string;
  image?: ImageProps | string;
  createdAt?: string;
  column: string;
  author?: string;
}
// 全局数据类型
export interface GlobalDataProps {
  token: string;
  loading: boolean;
  columns: ColumnProps[];
  posts: PostProps[];
  user: UserProps;
  error: GlobalErrorProps;
}
// 全局错误信息
export interface GlobalErrorProps {
  status: boolean;
  message?: string;
}
// 提取async await 的公共函数
const getAndCommit = async (url: string, mutationName: string, commit: Commit) => {
  const { data } = await axios.get(url)
  commit(mutationName, data)
  return data
}
// 创建和发送请求
const postAndCommit = async (url: string, mutationName: string, commit: Commit, payload: any) => {
  const { data } = await axios.post(url, payload)
  commit(mutationName, data)
  return data
}
const store = createStore<GlobalDataProps>({
  state: {
    token: localStorage.getItem('token') || '',
    loading: false,
    columns: [],
    posts: [],
    user: { isLogin: false },
    error: { status: false }
  },
  mutations: {
    // 用户登录后修改数据
    // login (state) {
    //   state.user = { ...state.user, isLogin: true, nickName: 'ytt' }
    // },
    // 新建文章(添加到对应的作者文章列表上)
    createPost (state, newPost) {
      state.posts.push(newPost)
    },
    // 将专栏列表的假数据替换成真实后端数据
    fetchColumns (state, rawData) {
      state.columns = rawData.data.list
    },
    // 替换单个专栏的数据
    fetchColumn (state, rawData) {
      state.columns = [rawData.data]
    },
    // 替换某个专栏的文章列表
    fetchPosts (state, rawData) {
      state.posts = rawData.data.list
    },
    // 设置loading 状态
    setLoading (state, status) {
      state.loading = status
    },
    // 登录获取 token
    login (state, rawData) {
      const { token } = rawData.data
      state.token = token
      // 存储token
      localStorage.setItem('token', token)
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
    },
    // 获取用户登录信息
    fetchCurrentUser (state, rawData) {
      state.user = { isLogin: true, ...rawData.data }
    },
    // 设置错误信息
    setError (state, e: GlobalErrorProps) {
      state.error = e
    },
    // token 请求失败时
    logout (state) {
      state.token = ''
      localStorage.remove('token')
      delete axios.defaults.headers.common.Authorization
    }
  },
  actions: {
    // 获取专栏列表
    // fetchColumns (context) {
    //   axios.get('/columns').then(resp => {
    //     context.commit('fetchColumns', resp.data)
    //   })
    // },
    // async fetchColumns ({ commit }) {
    //   const { data } = await axios.get('/columns')
    //   commit('fetchColumns', data)
    // },
    fetchColumns ({ commit }) {
      getAndCommit('/columns', 'fetchColumns', commit)
    },
    // 获取单个专栏
    // fetchColumn ({ commit }, cid) {
    //   axios.get(`/columns/${cid}`).then(resp => {
    //     commit('fetchColumn', resp.data)
    //   })
    // },
    // async fetchColumn ({ commit }, cid) {
    //   const { data } = await axios.get(`/columns/${cid}`)
    //   commit('fetchColumn', data)
    // },
    fetchColumn ({ commit }, cid) {
      return getAndCommit(`/columns/${cid}`, 'fetchColumn', commit)
    },
    // 获取单个专栏的文章
    // fetchPosts ({ commit }, cid) {
    //   axios.get(`/columns/${cid}/posts`).then(resp => {
    //     commit('fetchPosts', resp.data)
    //   })
    // }
    // async fetchPosts ({ commit }, cid) {
    //   const { data } = await axios.get(`/columns/${cid}/posts`)
    //   commit('fetchPosts', data)
    // }
    fetchPosts ({ commit }, cid) {
      return getAndCommit(`/columns/${cid}/posts`, 'fetchPosts', commit)
    },
    // 用户登录时，发送请求
    login ({ commit }, payload) {
      return postAndCommit('/user/login', 'login', commit, payload)
    },
    // 创建文章
    createPost ({ commit }, payload) {
      return postAndCommit('/posts', 'createPost', commit, payload)
    },
    // 请求获取当前用户信息
    fetchCurrentUser ({ commit }) {
      return getAndCommit('/user/current', 'fetchCurrentUser', commit)
    },
    // 组合两个actions
    loginAndFetch ({ dispatch }, loginData) {
      return dispatch('login', loginData).then(() => {
        return dispatch('fetchCurrentUser')
      })
    }
  },
  getters: {
    getColumnById: (state) => (id: string) => {
      return state.columns.find(c => c._id === id)
    },
    getPostsByCid: (state) => (cid: string) => {
      return state.posts.filter(post => post.column === cid)
    }
  }
})

export default store
