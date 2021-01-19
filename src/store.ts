import { createStore, Commit } from 'vuex'
import axios, { AxiosRequestConfig } from 'axios'

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
  fitUrl?: string;
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
  author?: string | UserProps;
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
// const getAndCommit = async (url: string, mutationName: string, commit: Commit) => {
//   const { data } = await axios.get(url)
//   commit(mutationName, data)
//   return data
// }
// 创建和发送请求
// const postAndCommit = async (url: string, mutationName: string, commit: Commit, payload: any) => {
//   const { data } = await axios.post(url, payload)
//   commit(mutationName, data)
//   return data
// }
const asyncAndCommit = async (url: string, mutationName: string, commit: Commit, config: AxiosRequestConfig = { method: 'get'}) => {
  const { data } = await axios(url, config)
  commit (mutationName, data)
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
    // 新建文章(添加到对应的作者文章列表上)
    createPost (state, newPost) {
      state.posts.push(newPost)
    },
    // 删除文章操作(使得文章列表不包含当前ID的文章)
    deletetePost (state, { data }) {
      state.posts = state.posts.filter(post => post._id !== data._id)
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
    // 获取单个文章数据
    fetchPost (state, rawData) {
      state.posts = [rawData.data]
    },
    // 更新文章
    updatePost (state, { data }) {
      state.posts = state.posts.map(post =>{
        if (post._id === data._id) {
          return data
        } else {
          return post
        }
      })
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
    fetchColumns ({ commit }) {
      return asyncAndCommit('/columns', 'fetchColumns', commit)
    },
    // 获取单个专栏
    fetchColumn ({ commit }, cid) {
      return asyncAndCommit(`/columns/${cid}`, 'fetchColumn', commit)
    },
    // 获取单个专栏的文章
    fetchPosts ({ commit }, cid) {
      return asyncAndCommit(`/columns/${cid}/posts`, 'fetchPosts', commit)
    },
    // 获取单个文章数据
    fetchPost ({ commit }, id) {
      return asyncAndCommit(`/posts/${id}`, 'fetchPost', commit)
    },
    // 更新文章
    updatePost ({ commit }, { id, payload}) {
      return asyncAndCommit(`/posts/${id}`, 'updatePosts', commit, {
        method: 'patch',
        data: payload
      })
    },
    // 用户登录时，发送请求
    login ({ commit }, payload) {
      return asyncAndCommit('/user/login', 'login', commit, { method: 'post', data: payload })
    },
    // 创建文章
    createPost ({ commit }, payload) {
      return asyncAndCommit('/posts', 'createPost', commit, { method: 'post' })
    },
    // 删除文章
    deletePost ({ commit }, id) {
      return asyncAndCommit(`/posts/${id}`, 'deletePost', commit, { method: 'delete', data: id })
    },
    // 请求获取当前用户信息
    fetchCurrentUser ({ commit }) {
      return asyncAndCommit('/user/current', 'fetchCurrentUser', commit)
    },
    // 组合两个actions
    loginAndFetch ({ dispatch }, loginData) {
      return dispatch('login', loginData).then(() => {
        return dispatch('fetchCurrentUser')
      })
    }
  },
  getters: {
    // 通过ID 获取专栏数据
    getColumnById: (state) => (id: string) => {
      return state.columns.find(c => c._id === id)
    },
    // 通过ID获取文章
    getPostsByCid: (state) => (cid: string) => {
      return state.posts.filter(post => post.column === cid)
    },
    // 获取当前文章数据
    getCurrentPost: (state) => (id: string) => {
      return state.posts.find(post => post._id === id)
    }
  }
})

export default store
