<template>
<teleport to="#modal">
  <div v-if="visible" class="modal d-block" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{title}}</h5>
          <button @click="onClose" type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer">
          <button  @click="onClose" type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
          <button @click="onConfirm" type="button" class="btn btn-primary">确定</button>
        </div>
      </div>
    </div>
  </div>
</teleport>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import useDOMCreate from '../hooks/useDOMCreate'

export default defineComponent({
  name: 'modal',
  props: {
    title: String,
    visible: {
      type: Boolean,
      default: false
    }
  },
  emits: ['modal-close', 'modal-on-confirm'],
  setup (props, context) {
    useDOMCreate('modal')
    const onClose = () => {
      context.emit('modal-on-close')
    }
    const onConfirm = () => {
      context.emit('modal-on-confirm')
    }
    return {
      onClose,
      onConfirm
    }
  }
})
</script>

<style>

</style>