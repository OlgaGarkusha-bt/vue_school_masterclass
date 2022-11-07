import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router/index.js'
import store from '@/store'
import firebase from 'firebase'
import firebaseConfig from '@/config/firebase'
import FontAwesome from '@/plugins/fontAwesome'
import ClickOutsideDirective from '@/plugins/ClickOutsideDirective'

// Initialize Firebase:
firebase.initializeApp(firebaseConfig)

const app = createApp(App)

app.use(router).use(store).use(FontAwesome).use(ClickOutsideDirective)

const requireComponent = require.context('./components', true, /App[A-Z]\w+\.(vue|js)$/)
requireComponent.keys().forEach(function (fileName) {
  let baseComponentConfig = requireComponent(fileName)
  baseComponentConfig = baseComponentConfig.default || baseComponentConfig
  const baseComponentName = baseComponentConfig.name || (
    fileName
      .replace(/^.+\//, '')
      .replace(/\.\w+$/, '')
  )
  app.component(baseComponentName, baseComponentConfig)
})


app.mount('#app')
