<template>
  <q-page class="flex column items-center">
    <h1>Exportar</h1>
    <button @click="uploadFiles">Enviar a Google Drive</button>
  </q-page>
</template>

<script>
import { defineComponent, getCurrentInstance } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  setup() {
    const $store = useStore()
    const _instance = getCurrentInstance()
    const $gapi = _instance.appContext.app.config.globalProperties.$gapi

    async function uploadFiles() {
      if (!$gapi.isAuthenticated()) {
        $gapi.login().then(({ currentUser, gapi, hasGrantedScopes }) => {
          console.log({ currentUser, gapi, hasGrantedScopes })
        })
      }
      const client = await $gapi.getGapiClient()
      let folderdata = new Object();
      folderdata.title = 'CensaArbol';
      folderdata.mimeType = "application/vnd.google-apps.folder";
      /*let folderinfo = await gapi.client.request({
          'path': '/drive/v2/files',
          'method': 'POST',
          'body': JSON.stringify(folderdata)}).execute();*/
      let folderinfo = await gapi.client.drive.files.create({
        'mimeType': "application/vnd.google-apps.folder",
        'name': "CensaArbol"
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
      var form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
      form.append('file', file);

      var xhr = new XMLHttpRequest();
      xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id');
      xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
      xhr.responseType = 'json';
      xhr.onload = () => {
          console.log(xhr.response.id); // Retrieve uploaded file ID.
      };
      xhr.send(form);

    }
    return { uploadFiles }
  }
})
</script>
