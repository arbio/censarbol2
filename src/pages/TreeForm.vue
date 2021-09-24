<template>
<q-page class="flex column items-center">
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
          <q-img class="rounded-borders full-height" :src="objUris[photo]">
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
        class="q-gutter-md"
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
        <q-input
          filled
          v-for="field,index in fields"
          v-model="data[fields[index].name]"
          :key="fields[index].name"
          :label="field.label"
          :hint="field.hint"
        />
        <div>
          <q-btn class="glossy" label="Enviar" type="submit" color="secondary"/>
        </div>
        </q-card-section>
	<q-separator />
        <q-card-section>
        <div>
          <q-btn class="glossy" rounded color="red-8" label="Borrar" @click="removeItem" />
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
import { defineComponent, reactive, ref, onMounted } from 'vue'
import { Geolocation } from '@capacitor/geolocation'
import { Camera, CameraResultType, CameraDirection } from '@capacitor/camera'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { extend } from 'quasar'
import model from '../store/model'

export default defineComponent({
  name: 'TreeForm',
  setup: function (props, context) {
    const $store = useStore()
    const $router = useRouter()
    const id = context.attrs.treeId
    let data
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
        name: '',
        photos: []
      })
    }
    function onSubmit() {
      console.log("submitted")
      $store.commit("trees/saveTree", data)
      $router.push ('/')
    }
    function removeItem(ev) {
      $store.commit("trees/removeTree", thisTree.name)
      console.log("removed", thisTree.name)
      $router.push ('/')
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
    }
    async function getPhoto() {
      const image = await Camera.getPhoto({
          quality: 90,
          resultType: CameraResultType.Uri,
          direction: CameraDirection.Front,
          webUseInput: true
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
    return { data, fields, onSubmit, removeItem, getLocations, getPhoto,
             objUris, onMounted, removePhoto, slide }
  }
})
</script>
<style>
.hydrated {
  z-index: 7000;
}
</style>
