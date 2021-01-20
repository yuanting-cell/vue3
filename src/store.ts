import { createStore, Commit } from 'vuex'
import axios, { AxiosRequestConfig } from 'axios'
import { arrToObj, objToArr } from './helper'

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
// 列表数据格式
interface ListProps<P> {
  [id: string]: P;
}
// 全局数据类型
export interface GlobalDataProps {
  token: string;
  loading: boolean;
  columns: { data: ListProps<ColumnProps>; currentPage: number; total: number };
  posts: { data: ListProps<PostProps>; loadedColumns: string[] };
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
const asyncAndCommit = async (url: string, mutationName: string, commit: Commit, config: AxiosRequestConfig = { method: 'get' }, extraData?: any) => {
  const { data } = await axios(url, config)
  if (extraData) {
    commit(mutationName, { data, extraData })
  } else {
    commit(mutationName, data)
  }
  return data
}
const store = createStore<GlobalDataProps>({
  state: {
    token: localStorage.getItem('token') || '',
    loading: false,
    columns: { data: {}, currentPage: 0, total: 0 },
    posts: { data: {}, loadedColumns: [] },
    user: { isLogin: false },
    error: { status: false }
  },
  mutations: {
    // 新建文章(添加到对应的作者文章列表上)
    createPost (state, newPost) {
      state.posts.data[newPost._id] = newPost
    },
    // 删除文章操作(删除列表中当前ID的文章)
    deletetePost (state, { data }) {
      delete state.posts.data[data._id]
    },
    // 将专栏列表的假数据替换成真实后端数据
    fetchColumns (state, rawData) {
      const { data } = state.columns
      const { list, count, currentPage } = rawData.data
      state.columns = {
        data: { ...data, ...arrToObj(list) },
        total: count,
        currentPage: currentPage * 1
      }
    },
    // 替换单个专栏的数据
    fetchColumn (state, rawData) {
      state.columns.data[rawData.data._id] = rawData.data
    },
    // 不断添加某个专栏的文章列表(将现有文章都添加进 loadedColumns 数组里面)
    fetchPosts (state, { data: rawData, extraData: columnId }) {
      state.posts.data = { ...state.posts.data, ...arrToObj(rawData.data.list) }
      state.posts.loadedColumns.push(columnId)
    },
    // 获取单个文章数据
    fetchPost (state, rawData) {
      state.posts.data[rawData.data._id] = rawData.data
    },
    // 更新文章内容
    updatePost (state, { data }) {
      state.posts.data[data._id] = data
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
    // 获取专栏列表(没有加载过才发送请求）)
    fetchColumns ({ state, commit }, params = {}) {
      const { currentPage = 1, pageSize = 6 } = params
      if (state.columns.currentPage < currentPage) {
        return asyncAndCommit(`/columns?currentPage=${currentPage}&pageSize=${pageSize}`, 'fetchColumns', commit)
      }
    },
    // 获取单个专栏
    fetchColumn ({ state, commit }, cid) {
      if (!state.columns.data[cid]) {
        return asyncAndCommit(`/columns/${cid}`, 'fetchColumn', commit)
      }
    },
    // 获取单个专栏的文章(如果文章列表包含当前文章，则不再发送请求)
    fetchPosts ({ state, commit }, cid) {
      if (!state.posts.loadedColumns.includes(cid)) {
        return asyncAndCommit(`/columns/${cid}/posts`, 'fetchPosts', commit, { method: 'get' }, cid)
      }
    },
    // 获取单个文章数据(如果当前ID的文章不在文章列表里面，且文章的content 不存在时，在发送请求)
    fetchPost ({ state, commit }, id) {
      const currentPost = state.posts.data[id]
      if (!currentPost || !currentPost.content) {
        return asyncAndCommit(`/posts/${id}`, 'fetchPost', commit)
      } else {
        return Promise.resolve({ data: currentPost })
      }
    },
    // 更新文章
    updatePost ({ commit }, { id, payload }) {
      return asyncAndCommit(`/posts/${id}`, 'updatePost', commit, {
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
    // 获取专栏列表
    getColumns: (state) => {
      return objToArr(state.columns.data)
    },
    // 通过ID 获取专栏数据
    getColumnById: (state) => (id: string) => {
      return state.columns.data[id]
    },
    // 通过ID获取文章列表
    getPostsByCid: (state) => (cid: string) => {
      return objToArr(state.posts.data).filter(post => post.column === cid)
    },
    // 获取当前文章内容
    getCurrentPost: (state) => (id: string) => {
      return state.posts.data[id]
    }
  }
})

export default store
