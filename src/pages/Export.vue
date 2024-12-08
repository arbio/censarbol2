<template>
  <q-page class="flex column items-center">
    <h2>Gestión<br>
      <q-badge class="text-h3"
              color="info"
              transparent
              v-if="trees_exist"
              :label="$store.state.trees.inventory.length +' items'"
      />
    </h2>
    <q-card  v-if="curState==='idle'" class="text-center">
      <q-card-section>
        <q-btn icon="cloud_upload" color="warning" @click="prompt()">Enviar a<br>Google<br>Drive</q-btn>
      </q-card-section>
      <q-card-section>
        <q-btn icon="delete" color="negative" @click="prompt_reset()">Vaciar<br>inventario<br>actual</q-btn>
      </q-card-section>
      <q-card-section>
        <q-icon name="upload"></q-icon>
        <q-file bg-color="secondary" v-model="importFile" @change="importDB" label="Importar archivo GeoJSON" />
      </q-card-section>
      <q-card-section>
        <q-btn icon="download" color="accent" @click="saveJSON">Guardar<br>inventario<br>localmente</q-btn>
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
import { defineComponent, getCurrentInstance, ref, computed } from 'vue'
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
          path: '/photos',
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
        this.progress = 0
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
        this.progress = 0+event.loaded/event.total/(files.length+1)*100
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
        console.log(item)
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
      let read = new FileReader()
      read.readAsBinaryString(importFile.value)
      read.onloadend = function(){
        let importedGeoJSON = JSON.parse(read.result)
        console.log(importedGeoJSON)
        for (let feature of importedGeoJSON.features) {
          let tree = {
            'location_latitude': feature.geometry.coordinates[1],
            'location_longitude': feature.geometry.coordinates[0],
            ...feature.properties
          }
          $store.commit("trees/saveTree", tree)
        }
      }
    }

    function saveJSON(){
      var fileContent = toGeoJSON($store.state.trees.inventory)
      var file = new Blob([fileContent], {type: 'text/plain'})
      saveAs(file, 'inventario.geojson')
    }

    const trees_exist = computed({
      get: () => ($store.state.trees.inventory.length > 0)
    })

    return { uploadFiles, importFile, curState, progress, saveJSON,
      trees_exist, prompt, prompt_reset, inventory_name, resetDB, importDB }
  }
})
</script>
