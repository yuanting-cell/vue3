<template>
  <div class="validate-input-container pb-3">
    <input
      v-if="tag !== 'textarea'"
      class="form-control"
      :class="{'is-invalid': inputRef.error}"
      @blur="validateInput"
      v-model="inputRef.val"
      v-bind="$attrs"
    >
    <textarea
      v-else
      class="form-control"
      :class="{'is-invalid': inputRef.error}"
      @blur="validateInput"
      v-model="inputRef.val"
      v-bind="$attrs"
    >
    </textarea>
    <span v-if="inputRef.error" class="invalid-feedback">{{inputRef.message}}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, PropType, onMounted, watch, computed } from 'vue'
import { emitter } from './ValidateForm.vue'

// email 正则表达式
const emailReg = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
// 定义验证信息数据类型
export interface RuleProp {
  type: 'required' | 'email' | 'custom';
  message: string;
  validator?: () => boolean;
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
      // 使用computed 属性就可以用v-model 方式绑定，而不用：value=inputref.val,@input=updatevValue方法了
      val: computed({
        get: () => props.modelValue || '',
        set: val => {
          context.emit('update:modelValue', val)
        }
      }),
      error: false,
      message: ''
    })
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
            case 'custom':
              passed = rule.validator ? rule.validator() : true
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
      validateInput
    }
  }
})
</script>

<style>

</style>
