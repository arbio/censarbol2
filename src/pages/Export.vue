<template>
  <q-page class="flex column items-center">
    <h1>Gestión</h1>
    <q-card class="text-center">
      <q-card-section>
        <button color="warning" v-if="curState==='idle'" @click="prompt">Enviar a Google Drive</button>
      </q-card-section>
    </q-card>
    <hr>
    <q-card class="text-center">
      <q-card-section>
        <button color="negative" v-if="curState==='idle'" @click="prompt_reset">Vaciar inventario actual</button>
      </q-card-section>
      <q-card-section>
        O importar un registro anterior:
        <q-file v-model="importFile" @change="importDB" label="Archivo geoJSON" />
      </q-card-section>
    </q-card>
    <q-circular-progress
        :indeterminate="curState==='starting'"
        v-if="curState!=='idle'" 
        show-value
        :value="progress"
        size="150px"
        color="orange"
        class="q-ma-md"
      >
      <q-icon name="hourglass_bottom" v-if="curState==='starting'" />
      <q-icon name="cloud_upload" v-if="curState==='uploading'" />
      <q-icon name="done" v-if="curState==='done'" />
    </q-circular-progress>
  </q-page>
</template>

<script>
import { defineComponent, getCurrentInstance, ref } from 'vue'
import { useStore } from 'vuex'
import { useQuasar } from 'quasar'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { sleep, toGeoJSON } from '../util.js'
import { saveAs } from 'file-saver'

export default defineComponent({
  setup() {
    const $store = useStore()
    const $q = useQuasar()
    const _instance = getCurrentInstance()
    const $gapi = _instance.appContext.app.config.globalProperties.$gapi
    let curState = ref("idle")
    let progress = ref(0)
    const datestring = (new Date()).toISOString().replace(/:|-/g, '').substring(0,13)
    let inventory_name = ref('Censo_' + datestring)
    let importFile = ref(null)

    function prompt () {
      $q.dialog({
        title: 'Crear directorio',
        message: 'El inventario y las fotos se ubicarán en esta carpeta en Google Drive.',
        prompt: {
          model: this.inventory_name,
          type: 'text' // optional
        },
        cancel: true,
        persistent: true
      }).onOk(data => {
        this.uploadFiles()
      }).onCancel(() => {
        console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }

    function prompt_reset () {
      $q.dialog({
        title: 'Vaciar inventario actual',
        message: 'Elimina los registros y fotos. Asegúrese de haber exportado sus datos.',
        cancel: true,
        persistent: true
      }).onOk(data => {
        this.resetDB()
      }).onCancel(() => {
        console.log('>>>> Cancel')
      }).onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      })
    }

    async function uploadFiles() {
      this.curState = "starting"
      if (!$gapi.isAuthenticated()) {
        $gapi.login().then(({ currentUser, gapi, hasGrantedScopes }) => {
          console.log('OKOKOK')
          console.log({ currentUser, gapi, hasGrantedScopes })
          this.uploadFiles()
        })
        return
      }
      const client = await $gapi.getGapiClient()
      let folderinfo = await gapi.client.drive.files.create({
        'mimeType': "application/vnd.google-apps.folder",
        'name': this.inventory_name
      });

      var fileContent = toGeoJSON($store.state.trees.inventory)
      var file = new Blob([fileContent], {type: 'text/plain'})
      var metadata = {
          'name': 'inventario.geojson', // Filename at Google Drive
          'mimeType': 'json/geojson', // mimeType at Google Drive
          'parents': [folderinfo.result.id], // Folder ID at Google Drive
      };

      var accessToken = client.auth.getToken().access_token; // Here gapi is used for retrieving the access token.
      let form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
      form.append('file', file);

      let files
      try {
        files = (await Filesystem.readdir({
          path: 'photos/',
          directory: Directory.External
        })).files
      }
      catch {
        files = []
      }

      let xhr = new XMLHttpRequest();
      xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id');
      xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
      xhr.responseType = 'json';
      xhr.upload.onload = () => {
        this.progress = 1/(files.length+1)*100
        this.curState = "uploading"
        if (files.length==0) {
          this.curState = "done"
          return
        }
      };
      xhr.upload.onerror = () => {
        console.error('Upload failed.');
      }
      xhr.upload.onprogress = event => {
  	this.progress = 1+event.loaded/event.total/(files.length+1)*100
      }
      xhr.send(form);

      let photofolderinfo = await gapi.client.drive.files.create({
        'mimeType': "application/vnd.google-apps.folder",
        'parents': [folderinfo.result.id],
        'name': 'photos'
      });

      let n = 0
      let z = 0
      for (let item of files) {
        let fileItem = await Filesystem.readFile({
          path: 'photos/'+item,
          directory: Directory.External
        })

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
        xhr.upload.onload = () => {
          n = n + 1
          this.progress = (1+n) /(files.length+1)*100
          if (n == files.length)
            this.curState = "done"
        }
        xhr.upload.onerror = () => {
          console.error('Upload failed.');
        }
        xhr.upload.onprogress = event => {
          this.progress = (1+n+event.loaded/event.total) / (files.length + 1)*100
        }
        while(true) {
          await sleep(500)
          if ( z - n < 1) break
        }
        xhr.send(form)
        z = z + 1
      }
    }

    async function resetDB() {
      $store.commit("trees/resetDB")
    }

    async function importDB() {
      console.log('lets import!')
      console.log(importFile)
      let read = new FileReader()
      read.readAsBinaryString(importFile.value)
      read.onloadend = function(){
        let importedGeoJSON = JSON.parse(read.result)
        console.log(importedGeoJSON)
      }
    }

    return { uploadFiles, importFile, curState, progress,
      prompt, prompt_reset, inventory_name, resetDB, importDB }
  }
})
</script>
