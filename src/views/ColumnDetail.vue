<template>
  <div class="column-detail-page w-75 mx-auto">
    <div class="column-info row mb-4 border-bottom pb-4 align-items-center" v-if="column">
      <div class="col-3 text-center">
        <img :src="column.avatar && column.avatar.fitUrl" :alt="column.title" class="rounded-circle border w-100">
      </div>
      <div class="col-9">
        <h4>{{column.title}}</h4>
        <p class="text-muted">{{column.description}}</p>
      </div>
    </div>
    <post-list :list="list"></post-list>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { GlobalDataProps } from '../store'
import { testData, testPosts } from '../testData'
import PostList from '../components/PostList.vue'
export default defineComponent({
  components: {
    PostList
  },
  setup () {
    // 获取路由的信息
    const route = useRoute()
    // 使用store数据
    const store = useStore<GlobalDataProps>()
    // 获取当前页面的ID值
    const currentId = route.params.id
    // 当专栏列表的ID值 = currentId时返回该对象=>column
    // const column = store.state.columns.find(c => c.id === currentId)
    const column = computed(() => store.getters.getColumnById(currentId))
    // 当专栏详情的columnId = currentId时，返回符合条件的对象=> list[]
    // const list = store.state.posts.filter(post => post.columnId === currentId)
    const list = computed(() => store.getters.getPostsByCid(currentId))
    // 传入当前页面的ID值，替换专栏文章数据
    onMounted(() => {
      store.dispatch('fetchColumn', currentId)
      store.dispatch('fetchPosts', currentId)
    })
    return {
      column,
      list
    }
  }
})
</script>
