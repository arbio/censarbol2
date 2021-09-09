<template>
<q-page class="flex column items-center">
  <div class="q-pa-md full-width q-gutter-md">
    <q-carousel
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
          <q-img class="rounded-borders col-6 full-height" :src="objUris[photo]" />
          <q-img class="rounded-borders col-6 full-height" :src="objUris[data.photos[index+1]]" />
        </div>
      </q-carousel-slide>
    </q-carousel>

    <q-form
      @submit="onSubmit"
      class="q-gutter-md"
    >
      <q-img class="rounded-borders col-6 full-height" v-if="lastPic" :src="lastPic" />
      <q-btn text-color="black" label="GPS" @click="getLocations()" color="primary"/>
      <q-btn text-color="black" label="FOTO" @click="getPhoto()" color="primary"/>
      <q-input
        filled
        v-for="field,index in fields"
        v-model="data[fields[index].name]"
        :key="fields[index].name"
        :label="field.label"
        :hint="field.hint"
      />
      <div>
        <q-btn label="Enviar" type="submit" color="primary"/>
      </div>
    </q-form>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="west" color="positive" :to="{path: '/'}" />
    </q-page-sticky>
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
import model from '../store/model'

export default defineComponent({
  name: 'TreeForm',
  setup: function (props, context) {
    const $store = useStore()
    const $router = useRouter()
    const id = context.attrs.treeId
    let data
    let lastPic = ref('')
    let fields = model.inventory
    let objUris = reactive({})
    let slide = ref(0)
    const thisTree = $store.state.trees.inventory.find(tree=>tree.name===id)
    if (thisTree) {
      let clone = Object.assign({}, thisTree)
      data = reactive(clone)
    }
    else {
      data = reactive({
        name: '123',
        photos: []
      })
    }
    function onSubmit() {
      console.log("submitted")
      $store.commit("trees/saveTree", data)
      $router.push ('/')
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
          direction: CameraDirection.Front
      })
      let datestring = new Date().toISOString()
      let filename = '/photos/tree_' + datestring + '.' + image.format
      this.lastPic = image.webPath
      let blob = await fetch(this.lastPic).then(r => r.blob())
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
    return { data, fields, onSubmit, getLocations, getPhoto, lastPic,
             objUris, onMounted, slide }
  }
})
</script>
<style>
.hydrated {
  z-index: 7000;
}
</style>