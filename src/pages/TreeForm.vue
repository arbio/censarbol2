<template>
<q-page class="flex flex-center">
  <div class="q-pa-md">
    <q-form
      @submit="onSubmit"
      class="q-gutter-md"
    >
      <q-btn label="GPS" @click="getLocations()" color="primary"/>
      <q-btn label="FOTO" @click="getPhoto()" color="primary"/>
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

    <q-page-sticky position="bottom-left" :offset="[18, 18]">
      <q-btn fab icon="west" color="positive" :to="{path: '/'}" />
    </q-page-sticky>
  </div>
</q-page>
</template>

<script>
import { defineComponent, onMounted, computed, reactive } from 'vue'
import { Geolocation } from '@capacitor/geolocation'
import { Camera, CameraResultType } from '@capacitor/camera'
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
    let fields = model.inventory
    const thisTree = $store.state.trees.inventory.find(tree=>tree.name===id)
    if (thisTree) {
      let clone = Object.assign({}, thisTree)
      data = reactive(clone)
    }
    else {
      data = reactive({
        name: '123'
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
          allowEditing: true,
          resultType: CameraResultType.Uri
      })
      console.log(image)
    }
    return { data, fields, onSubmit, getLocations, getPhoto }
  }
})
</script>