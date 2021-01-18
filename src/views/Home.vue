<template>
  <div class="home-page">
    <section class="py-5 text-center container">
      <div class="row py-lg-5">
        <div class="col-lg-6 col-md-8 mx-auto">
          <img src="../assets/callout.svg" alt="callout" class="w-50"/>
          <h2 class="font-weight-light">随心写作，自由表达</h2>
          <p>
            <a href="#" class="btn btn-primary my-2">开始写文章</a>
          </p>
        </div>
      </div>
    </section>
    <!-- <uploader
    actions='/upload'
    :beforeUpload="beforeUpload"
    @file-uploaded="onFileUploaded">
      <template #uploaded='dataProps'>
        <img :src='dataProps.uploadedData.data.url' width='500' />
      </template>
    </uploader> -->
    <h4 class="font-weight-bold text-center">发现精彩</h4>
    <column-list :list="list"></column-list>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { GlobalDataProps, ResponseType, ImageProps } from '../store'
import ColumnList from '../components/ColumnList.vue'
// import Uploader from '../components/Uploader.vue'
import createMessage from '../components/createMessage'

export default defineComponent({
  name: 'Home',
  components: {
    ColumnList
    // Uploader
  },
  setup () {
    const store = useStore<GlobalDataProps>()
    // 调用fetchColumns方法,更新专栏列表数据
    onMounted(() => {
      store.dispatch('fetchColumns')
    })
    // 通过computed 检测store.state.columns的变化并作出响应
    const list = computed(() => store.state.columns)
    // 用户自定义需求——上传JPG 格式的图片
    // const beforeUpload = (file: File) => {
    //   const isJPG = file.type === 'image/jpeg'
    //   if (!isJPG) {
    //     createMessage('上传图片只能是JPG 格式！', 'error')
    //   }
    //   return isJPG
    // }
    // // 监听到 file-uploaded 时，即上传成功，执行下列函数
    // const onFileUploaded = (rawData: ResponseType<ImageProps>) => {
    //   // console.log('rawData', rawData)
    //   createMessage(`上传图片ID ${rawData.data._id}`, 'success')
    // }
    // // 监听到 file-uploaded-error 时，即上传失败，执行下面函数
    // const onFileUploadedError = (rawData) => {
    //   createMessage(rawData.error, 'error')
    // }
    return {
      list
      // beforeUpload,
      // onFileUploaded
    }
  }
})
</script>
