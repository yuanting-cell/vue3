<template>
  <div class="dropdown" ref="dropdownRef">
    <a href="#" class="dropdown-toggle btn btn-outline-light my-2" @click.prevent="toggleOpen">{{title}}</a>
    <ul v-if="isOpen" class="dropdown-menu" :style="{display: 'block'}">
      <slot></slot>
    </ul>
</div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import useClickOutside from '../hooks/useClickOutside'

export default defineComponent({
  name: 'Dropdown',
  props: {
    title: {
      type: String,
      required: true
    }
  },
  setup () {
    const isOpen = ref(false)
    // 点击空白处关闭下拉菜单
    // 获取DOM 节点
    const dropdownRef = ref<null | HTMLElement>(null)
    const toggleOpen = () => {
      isOpen.value = !isOpen.value
    }
    // 调用useClickOutside 函数，获取 isClickOutside 的值
    const isClickOutside = useClickOutside(dropdownRef)
    // 当下拉菜单打开时，并且的dropdown 不包含点击对象时，关闭下拉菜单
    watch(isClickOutside, () => {
      if (isOpen.value && isClickOutside.value) {
        isOpen.value = false
      }
    })
    return {
      isOpen,
      toggleOpen,
      dropdownRef
    }
  }
})
</script>

<style>

</style>
