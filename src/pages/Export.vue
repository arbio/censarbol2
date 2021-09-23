<template>
  <q-page class="flex column items-center">
    <h1>Exportar</h1>
    <button @click="uploadFiles">Enviar a Google Drive</button>
  </q-page>
</template>

<script>
import { defineComponent, getCurrentInstance } from 'vue'

export default defineComponent({
  setup() {
    const _instance = getCurrentInstance()
    const $gapi = _instance.appContext.app.config.globalProperties.$gapi
    console.log(_instance.appContext.app.config.globalProperties)

    function uploadFiles() {
        $gapi.login().then(({ currentUser, gapi, hasGrantedScopes }) => {
          console.log({ currentUser, gapi, hasGrantedScopes })
        })
    }
    return { uploadFiles }
  }
})
</script>
