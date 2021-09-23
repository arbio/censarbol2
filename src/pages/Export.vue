<template>
  <q-page class="flex column items-center">
    <h1>Exportar</h1>
    <button v-if="curState==='idle'" @click="uploadFiles">Enviar a Google Drive</button>
    <br>
    <q-circular-progress
        v-if="curState!=='idle'" 
        show-value
        :value="progress"
        size="150px"
        color="orange"
        class="q-ma-md"
      >
      <q-icon name="cloud_upload" v-if="curState==='uploading'" />
      <q-icon name="done" v-if="curState==='done'" />
    </q-circular-progress>
  </q-page>
</template>

<script>
import { defineComponent, getCurrentInstance, ref } from 'vue'
import { useStore } from 'vuex'
import { Filesystem, Directory } from '@capacitor/filesystem'

export default defineComponent({
  setup() {
    const $store = useStore()
    const _instance = getCurrentInstance()
    const $gapi = _instance.appContext.app.config.globalProperties.$gapi
    let curState = ref("idle")
    let progress = ref(0)

    async function uploadFiles() {
      this.curState = "uploading"

      if (!$gapi.isAuthenticated()) {
        $gapi.login().then(({ currentUser, gapi, hasGrantedScopes }) => {
          console.log({ currentUser, gapi, hasGrantedScopes })
        })
      }
      const client = await $gapi.getGapiClient()
      let folderinfo = await gapi.client.drive.files.create({
        'mimeType': "application/vnd.google-apps.folder",
        'name': 'CensaArbol'
      });
      console.log(folderinfo.result)

      var fileContent = JSON.stringify($store.state.trees.inventory)
      var file = new Blob([fileContent], {type: 'text/plain'});
      var metadata = {
          'name': 'inventario.json', // Filename at Google Drive
          'mimeType': 'text/json', // mimeType at Google Drive
          'parents': [folderinfo.result.id], // Folder ID at Google Drive
      };

      var accessToken = client.auth.getToken().access_token; // Here gapi is used for retrieving the access token.
      let form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
      form.append('file', file);

      let xhr = new XMLHttpRequest();
      xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id');
      xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
      xhr.responseType = 'json';
      xhr.onload = () => {
          console.log(xhr.response.id); // Retrieve uploaded file ID.
      };
      xhr.send(form);

      let photofolderinfo = await gapi.client.drive.files.create({
        'mimeType': "application/vnd.google-apps.folder",
        'parents': [folderinfo.result.id],
        'name': 'photos'
      });

      const files = (await Filesystem.readdir({
        path: 'photos/',
        directory: Directory.External
      })).files

      this.progress = 1/(files.length+1)*100
      let n = 1
      for (let item of files) {
        n = n+1
        let fileItem = await Filesystem.readFile({
          path: 'photos/'+item,
          directory: Directory.External
        })
        console.log(fileItem)

        let metadata = {
            'name': item, // Filename at Google Drive
            'mimeType': fileItem.data.type, // mimeType at Google Drive
            'parents': [photofolderinfo.result.id], // Folder ID at Google Drive
        }

        let form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
        form.append('file', fileItem.data);

        let xhr = new XMLHttpRequest();
        xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id');
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        xhr.responseType = 'json';
        xhr.onload = () => {
            console.log(xhr.response.id); // Retrieve uploaded file ID.
        };
        xhr.send(form);
        this.progress = n /(files.length+1)*100
      }
      this.curState = "done"
    }
    return { uploadFiles, curState, progress }
  }
})
</script>
