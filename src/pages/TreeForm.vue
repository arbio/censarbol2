<template>
<q-page class="flex column">
  <datalist id="nombrescomunes">
    <option v-for="especie in especies" v-bind:key="especie" :value="especie" />
  </datalist>
  <datalist id="nombrescientificos">
    <option v-for="cientifico in cientificos" v-bind:key="cientifico" :value="cientifico" />
  </datalist>
  <div class="q-pa-md q-gutter-md">
    <q-carousel
      v-if="!(data.photos==undefined) && data.photos.length > 0"
      v-model="slide"
      transition-prev="slide-right"
      transition-next="slide-left"
      swipeable
      animated
      control-color="primary"
      navigation
      padding
      arrows
      class="--q-primary shadow-2 rounded-borders"
    >
      <q-carousel-slide class="column no-wrap" v-for="photo,index in data.photos" :name="index" :key="photo">
        <div class="row fit justify-start items-center q-gutter-xs q-col-gutter no-wrap">
          <q-img class="rounded-borders" fit="scale-down" :src="objUris[photo]">
            <q-icon
                name="delete"
                color="negative"
                class="bg-dark absolute all-pointer-events"
                @click="removePhoto(index)"
              />
          </q-img>
        </div>
      </q-carousel-slide>
    </q-carousel>

    <q-card class="my-card">

      <q-form
        @submit="onSubmit"
        class="q-gutter-md flex column"
      >
      <q-card-section>
      <q-toolbar>
        <q-btn-group push class="q-mx-auto">
        <q-btn icon="gps_fixed" text-color="black" label="GPS" @click="getLocations()" color="positive"/>
        <q-btn icon="camera" text-color="black" label="FOTO" @click="getPhoto()" color="positive"/>
        </q-btn-group>
      </q-toolbar>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="q-gutter-y-md">
        <q-input
          filled
          v-for="field,index in fields"
          v-show="!field.hidden"
          v-model="data[fields[index].name]"
          :key="fields[index].name"
          :label="field.label"
          :hint="field.hint"
          :rules="field.rules"
          :mask="field.mask"
          :hide-hint="true"
          :readonly="field.readonly"
          @change="changed(field)"
          :type="field.type!='date'? field.type:''"
          :list="field.list"
        >
        <template v-if="['date', 'option'].includes(field.type)" v-slot:append>
          <q-icon :name="iconfor[field.type]" class="cursor-pointer">
            <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
              <q-option-group
                        v-if="field.type=='option'"
                        :name="field.name"
                        v-model="data[fields[index].name]"
                        :options="field.options"
                        type="checkbox"
                        color="primary"
                      />
              <q-date v-model="data[fields[index].name]"
                        v-if="field.type=='date'"
              >
                <div class="row items-center justify-end">
                  <q-btn v-close-popup label="Close" color="primary" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>

        </q-input>
        </div>
        <div>
          <q-btn class="glossy" label="Guardar" type="submit" color="secondary"/>
        </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
        <div>
          <q-btn class="glossy" rounded color="red-8" label="Eliminar" @click="removeItem" />
        </div>
      </q-card-section>
      </q-form>

    </q-card>

    <!-- q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="west" color="positive" :to="{path: '/'}" />
    </q-page-sticky -->
  </div>
</q-page>
</template>

<script>
import { defineComponent, reactive, ref, onMounted, computed } from 'vue'
import { Geolocation } from '@capacitor/geolocation'
import { Camera, CameraResultType, CameraDirection } from '@capacitor/camera'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { extend } from 'quasar'
import model from '../store/model'
import { mobileAndTabletCheck } from '../util.js'

export default defineComponent({
  name: 'TreeForm',
  setup: function (props, context) {
    const $store = useStore()
    const $router = useRouter()
    const id = context.attrs.treeId
    let iconfor = {'date': 'event', 'option': 'rule'}
    let data
    let especies = computed(
      ()=>[... new Set($store.state.trees.inventory.filter(val=>!!val.especie)
                                      .map(val=>val.especie||''))]
    )
    let cientificos = computed(
      ()=>[... new Set($store.state.trees.inventory.filter(val=>!!val.cientifico)
                                      .map(val=>val.cientifico||''))]
    )
    let fields = model.inventory
    let objUris = reactive({})
    let slide = ref(0)
    const thisTree = $store.state.trees.inventory.find(tree=>tree.name===id)
    if (thisTree) {
      let clone = extend(true, {}, thisTree)
      data = reactive(clone)
    }
    else {
      data = reactive({
        name: ''
      })
    }
    if (data.photos==undefined) data.photos = []
    if (!Array.isArray(data.relevancia)) data.relevancia = []
    function onSubmit(ev) {
      console.log("submitted", data.name)
      $store.commit("trees/saveTree", data)
      if ( data.name!=context.attrs.treeId && context.attrs.treeId!='new') {
        $store.commit("trees/removeTree", context.attrs.treeId)
        console.log('removing', context.attrs.treeId)
      }
      $router.push ('/list')
    }
    function removeItem(ev) {
      if (thisTree) {
        $store.commit("trees/removeTree", thisTree.name)
        console.log("removed", thisTree.name)
      }
      $router.push ('/list')
    }
    async function removePhoto(index) {
      console.log('removing photo', data.photos[index])
      objUris[index] = undefined
      data.photos.splice(index, 1)
      await Filesystem.deleteFile({
        path: data.photos[index],
        directory: Directory.External
      })
    }
    function changed(field) {
      if (!!field.recalc) {
        for (let field of fields) {
          if (field.autocalc) {
            data[field.name] = field.autocalc(data)
          }
        }
      }
    }
    async function getLocations () {
      let coordinates
      try {
        coordinates = await Geolocation.getCurrentPosition()
      }
      catch (error) {
        console.log('No GPS', error)
        return
      }
      $store.commit("trees/addLocationPoint", coordinates)
      this.data.location_latitude = coordinates.coords.latitude
      this.data.location_longitude = coordinates.coords.longitude
      this.changed({recalc:true})
    }
    async function getPhoto() {
      const image = await Camera.getPhoto({
          quality: 90,
          resultType: CameraResultType.Uri,
          direction: CameraDirection.Front,
          webUseInput: mobileAndTabletCheck(),
          saveToGallery: true
      })
      let datestring = new Date().toISOString()
      let filename = '/photos/tree_' + datestring + '.' + image.format
      let blob = await fetch(image.webPath).then(r => r.blob())
      await Filesystem.writeFile({
        path: filename,
        directory: Directory.External,
        data: blob,
        encoding: Encoding.UTF8
      })
      if (this.data.photos === undefined) {
        this.data.photos = []
      }
      this.data.photos.push(filename)
      this.objUris[filename] = image.webPath
      this.slide = this.data.photos.length-1
      console.log(blob)
      console.log(image)
    }
    onMounted( async function() {
      if (data.date===undefined){
        let today = new Date()
        let month = today.getMonth()+1
        if (month <= 9) month = '0' + month
        let day = today.getDate()
        if (day <= 9) day = '0' + day
        data.date = today.getFullYear() + '/' + month + '/' + day
      }
      for (let photo of data.photos || []) {
        console.log(photo)
        try {
          let contents = await Filesystem.readFile({
            path: photo,
            directory: Directory.External,
            encoding: Encoding.UTF8
          })
          objUris[photo] = URL.createObjectURL(contents.data)
        }
        catch(e) {
          console.log('ERROR WITH: ', e)
        }
      }
    })
    return { data, fields, onSubmit, removeItem, getLocations, getPhoto, changed,
             objUris, onMounted, removePhoto, slide, iconfor, especies, cientificos }
  }
})
</script>
<style>
.hydrated {
  z-index: 7000;
}
</style>
