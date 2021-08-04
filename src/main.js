import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 引入字体文件
import './assets/font/iconfont.css'

import './assets/css/global.less'
import axios from 'axios'
//请求基本配置
axios.defaults.baseURL = 'http://127.0.0.1:8888/api'
//将axios挂载到Vue的原型上
//在别的组件中 this.$http,对axios进行封装
Vue.prototype.$http = axios


// 将全局的echarts对象挂载到Vue的原型对象上
//在别的组件中使用this.echarts就可以使用
Vue.prototype.$echarts = window.echarts


Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
