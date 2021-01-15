<template>
  <div class="validate-input-container pb-3">
    <input
      v-if="tag !== 'textarea'"
      class="form-control"
      :class="{'is-invalid': inputRef.error}"
      :value="inputRef.val"
      @blur="validateInput"
      @input="updateValue"
      v-bind="$attrs"
    >
    <textarea
      v-else
      class="form-control"
      :class="{'is-invalid': inputRef.error}"
      :value="inputRef.val"
      @blur="validateInput"
      @input="updateValue"
      v-bind="$attrs"
    >
    </textarea>
    <span v-if="inputRef.error" class="invalid-feedback">{{inputRef.message}}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType, onMounted } from 'vue'
import { emitter } from './ValidateForm.vue'

// email 正则表达式
const emailReg = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
// 定义验证信息数据类型
interface RuleProp {
  type: 'required' | 'email' | 'password';
  message: string;
}
// 定义表单类型是 input | textarea
export type TagType = 'input' | 'textarea'
export type RulesProp = RuleProp[]
export default defineComponent({
  props: {
    rules: Array as PropType<RulesProp>,
    modelValue: String,
    tag: {
      type: String as PropType<TagType>,
      default: 'input'
    }
  },
  inheritAttrs: false,
  setup (props, context) {
    // 表单数据
    const inputRef = reactive({
      val: props.modelValue || '',
      error: false,
      message: ''
    })
    // 自定义组件的数据双向绑定—— v-model
    const updateValue = (e: KeyboardEvent) => {
      // 获取输入框的值
      const targetValue = (e.target as HTMLInputElement).value
      // 将输入的值赋值给 inputRef.val
      inputRef.val = targetValue
      // 向外发送事件，传递数据
      context.emit('update:modelValue', targetValue)
    }
    // 验证input 函数 —— blur 时调用
    const validateInput = () => {
      if (props.rules) {
        // 对接收的数据rules 通过 every进行遍历，若有一个为passed=false, 则整个表达式返回allpassed=false；若全部passed=true ，整个表达式返回allpassed=true
        const allpassed = props.rules.every(rule => {
          let passed = true
          inputRef.message = rule.message
          switch (rule.type) {
            case 'required':
              passed = (inputRef.val.trim() !== '')
              break
            case 'email':
              passed = emailReg.test(inputRef.val)
              break
            default:
              break
          }
          return passed
        })
        inputRef.error = !allpassed
        return allpassed
      }
      return true
    }
    // 通过emitter 发送事件 form-item-created
    onMounted(() => {
      emitter.emit('form-item-created', validateInput)
    })
    return {
      inputRef,
      validateInput,
      updateValue
    }
  }
})
</script>

<style>

</style>
