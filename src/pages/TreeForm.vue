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
        v-model="location.latitude"
        label="Latitud"
        hint="GPS"
      />
      <q-input
        filled
        v-model="location.longitude"
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
import { defineComponent, onMounted, ref, computed } from 'vue';
import { Geolocation } from '@capacitor/geolocation';
import { useStore } from 'vuex'

export default defineComponent({
  name: 'TreeForm',
  setup: function (props, context) {
    const $store = useStore()
    const id = context.attrs.treeId
    let data
    if ($store.state.trees.inventory[id]) {
      data = computed({
        get: ()=>$store.state.trees.inventory[id],
        set: (formdata)=>{console.log(formdata)}
      })
    }
    else {
      data = computed({
        get: function() {return {}},
        set: (formdata)=>{console.log(formdata)}
      })
    }
    const location = {
        longitude: '',
        latitude: ''
    }
    return { data, location }
  },
  mounted () {
    this.getLocations()
  },
  methods: {
    onSubmit: ()=>{
      console.log("submitted")
    },
    async getLocations () {
      const coordinates = await Geolocation.getCurrentPosition()
      console.log(coordinates)
      this.location.latitude = coordinates.coords.latitude
      this.location.longitude = coordinates.coords.longitude
    }
  }
})
</script>