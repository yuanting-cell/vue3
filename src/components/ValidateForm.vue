<template>
  <form class="validate-form-container">
    <slot name="default"></slot>
    <div class="submit-area" @click="submitForm">
      <slot name="submit">
        <button type="submit" class="btn btn-primary">提交</button>
      </slot>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, onUnmounted } from 'vue'
import mitt from 'mitt'
// 创建事件监听器
export const emitter = mitt()
type ValidateFunc = () => boolean
export default defineComponent({
  emits: ['form-submit', 'clearInput'],
  setup (props, context) {
    // 存放函数的数组
    let funcArr: ValidateFunc[] = []
    // 点击提交，向外发送事件并传递数据
    const submitForm = () => {
      // 先用map 循环funArr，得到一个boolean数组，再用every进行循环，返回最终结果result
      const result = funcArr.map(func => func()).every(result => result)
      context.emit('form-submit', result)
    }
    // 将监听得到的验证函数都存到一个数组中
    const callback = (func?: ValidateFunc) => {
      if (func) {
        funcArr.push(func)
      }
    }
    // 监听事件
    emitter.on('form-item-created', callback)
    // 页面卸载时，清理监听器
    onUnmounted(() => {
      emitter.off('form-item-created', callback)
      funcArr = []
    })
    return {
      submitForm
    }
  }
})
</script>

<style>

</style>
