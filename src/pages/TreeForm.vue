<template>
<q-page class="flex flex-center">
  <div class="q-pa-md">
    <q-form
      @submit="onSubmit"
      class="q-gutter-md"
    >
      <q-input
        filled
        v-model="data.name"
        label="Individuo"
        hint="Identifíicador único"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Escribe algo porfavor']"
      />
      <q-input
        filled
        v-model="data.especie"
        label="Nombre Común"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Escribe algo porfavor']"
      />
      <q-input
        filled
        v-model="data.cientifico"
        label="Nombre Científico"
        hint="de la especie"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Escribe algo porfavor']"
      />
      <q-separator />
      <q-input
        filled
        v-model="data.location_latitude"
        label="Latitud"
        hint="GPS"
      />
      <q-input
        filled
        v-model="data.location_longitude"
        label="Longitud"
        hint="GPS"
      />
      <q-separator />
      <q-input
        filled
        v-model="data.circ"
        label="Circ.(cm)"
        hint="GPS"
      />
      <q-input
        filled
        v-model="data.alt"
        label="Alt.(m)"
        hint="GPS"
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
import { defineComponent, onMounted, computed, reactive } from 'vue';
import { Geolocation } from '@capacitor/geolocation';
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'TreeForm',
  setup: function (props, context) {
    const $store = useStore()
    const $router = useRouter()
    const id = context.attrs.treeId
    let data
    if ($store.state.trees.inventory[id]) {
      let clone = Object.assign({}, $store.state.trees.inventory[id])
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
    return { data, onSubmit }
  },
  mounted () {
    this.getLocations()
  },
  methods: {
    async getLocations () {
      const coordinates = await Geolocation.getCurrentPosition()
      console.log(coordinates)
      this.data.location_latitude = coordinates.coords.latitude
      this.data.location_longitude = coordinates.coords.longitude
    }
  }
})
</script>