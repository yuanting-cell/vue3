<template>
  <div class="file-upload">
    <div class="file-upload-container" @click.prevent="triggerUpload" v-bind="$attrs">
      <slot v-if="fileStatus==='loading'" name='loading'>
        <button class="btn btn-primary" disabled>正在上传...</button>
      </slot>
      <slot v-else-if="fileStatus==='success'" name='uploaded' :uploadedData='uploadedData'>
        <button class="btn btn-primary" disabled>上传成功</button>
      </slot>
      <slot v-else name='default'>
        <button class="btn btn-primary" disabled>点击上传</button>
      </slot>
    </div>
    <input
    type="file"
    class="file-input d-none"
    ref="fileInput"
    @change="handleFileChange">
  </div>
</template>

<script lang='ts'>
import { defineComponent, ref, PropType, watch } from 'vue'
import axios from 'axios'

type UploadStatus = 'ready' | 'loading' | 'success' | 'error'
type CheckFunction = (file: File) => boolean
export default defineComponent({
  props: {
    actions: {
      type: String,
      required: true
    },
    beforeUpload: {
      type: Function as PropType<CheckFunction>
    },
    uploaded: {
      type: Object
    }
  },
  emits: ['file-uploaded', 'file-uploaded-error'],
  inheritAttrs: false,
  setup (props, context) {
    console.log('props', props.uploaded)
    const fileInput = ref<null | HTMLInputElement>(null)
    const fileStatus = ref<UploadStatus>(props.uploaded ? 'success' : 'ready')
    // 上传成功之后更新数据
    const uploadedData = ref(props.uploaded)
    watch(() => props.uploaded, (newValue) => {
      if (newValue) {
        fileStatus.value = 'success'
        uploadedData.value = newValue
      }
    })
    // 点击上传按钮时
    const triggerUpload = () => {
      if (fileInput.value) {
        fileInput.value.click()
      }
    }
    // onChange 事件
    const handleFileChange = (e: Event) => {
      const currentTarget = e.target as HTMLInputElement
      if (currentTarget.files) {
        // 将 currentTarget.files 转化成数组
        const files = Array.from(currentTarget.files)
        // 检查是否满足用户自定义需求,若不满足，则直接返回，不进行下面的逻辑
        if (props.beforeUpload) {
          const result = props.beforeUpload(files[0])
          if (!result) {
            return
          }
        }
        fileStatus.value = 'loading'
        const formData = new FormData()
        formData.append('file', files[0])
        axios.post(props.actions, formData, {
          headers: {
            'Content-Type': 'multipart  form-data'
          }
        }).then(resp => {
          console.log(resp.data)
          fileStatus.value = 'success'
          uploadedData.value = resp.data
          // console.log('uploadedData', uploadedData)
          // 上传成功之后发送 file-uploaded 事件，并传递数据
          context.emit('file-uploaded', resp.data)
        }).catch((error) => {
          // 发生错误时，发送 file-uploaded-error 事件，
          console.log(error)
          fileStatus.value = 'error'
          context.emit('file-uploaded-error', { error })
        }).finally(() => {
          // 最后清空输入框的内容
          if (fileInput.value) {
            fileInput.value.value = ''
          }
        })
      }
    }
    return {
      fileInput,
      triggerUpload,
      handleFileChange,
      fileStatus,
      uploadedData
    }
  }
})
</script>

<style>

</style>
