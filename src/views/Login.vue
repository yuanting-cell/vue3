<template>
   <div class="login-page mx-auto p-3 w-330">
    <h5 class="my-4 text-center">登录到者也</h5>
    <validate-form @form-submit="onFormSubmit">
      <div class="mb-3">
        <label class="form-label">邮箱地址</label>
        <validate-input
          :rules="emailRules" v-model="emailVal"
          placeholder="请输入邮箱地址"
          type="text"
          ref="inputRef"
        />
      </div>
      <div class="mb-3">
        <label class="form-label">密码</label>
        <validate-input
          type="password"
          placeholder="请输入密码"
          :rules="passwordRules"
          v-model="passwordVal"
        />
      </div>
      <template #submit>
        <button type="submit" class="btn btn-primary btn-block btn-large">登录</button>
      </template>
    </validate-form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import ValidateInput, { RulesProp } from '../components/ValidateInput.vue'
import ValidateForm from '../components/ValidateForm.vue'

export default defineComponent({
  name: 'Login',
  components: {
    ValidateInput,
    ValidateForm
  },
  setup () {
    const store = useStore()
    // 定义路由的一系列行为
    const router = useRouter()
    // 邮箱的初始值和验证规则
    const emailVal = ref('')
    const emailRules: RulesProp = [
      { type: 'required', message: '电子邮箱地址不能为空' },
      { type: 'email', message: '请输入正确的电子邮箱格式' }
    ]
    // 密码的初始值和验证规则
    const passwordVal = ref('')
    const passwordRules: RulesProp = [
      { type: 'required', message: '密码不能为空' }
    ]
    // 监听到 form-submit时，执行函数，打印提交结果
    const onFormSubmit = (result: boolean) => {
      console.log('result', result)
      console.log('isLogin', store.state.user.isLogin)
      // 登录成功后，返回首页，并触发 store 中的 login函数=>改变 state.user 的值
      if (result) {
        const payload = {
          email: emailVal.value,
          password: passwordVal.value
        }
        store.dispatch('loginAndFetch', payload).then(data => {
          // 获取token
          console.log(data)
          router.push('/')
        })
        // router.push('/')
        // store.commit('login')
      }
    }
    return {
      emailRules,
      emailVal,
      passwordVal,
      passwordRules,
      onFormSubmit
    }
  }
})

</script>
