<template>
<q-page class="flex flex-center">
  <div class="q-pa-md">
    <q-form
      @submit="onSubmit"
      class="q-gutter-md"
    >
      <q-input
        filled
        v-model="name"
        label="Individuo"
        hint="Identifíicador único"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Escribe algo porfavor']"
      />
      <q-input
        filled
        v-model="especie"
        label="Nombre Común"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Escribe algo porfavor']"
      />
      <q-input
        filled
        v-model="cientifico"
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
        v-model="circ"
        label="Circ.(cm)"
        hint="GPS"
      />
      <q-input
        filled
        v-model="alt"
        label="Alt.(m)"
        hint="GPS"
      />

      <div>
        <q-btn label="Submit" type="submit" color="primary"/>
        <q-btn label="Reset" type="reset" color="primary" flat class="q-ml-sm" />
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
  setup: function () {
    const $store = useStore()
    const data = computed({
        get: ()=>$store.state.trees.inventory
    })
  },
  data: () => {
    return {
      name: "Uno",
      especie: "Dos",
      cientifico: "Tres",
      location: {
          latitude: '',
          longitude: ''
      },
      circ: '',
      alt: ''
    }
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
    },
    async handleNotification () {
      const isNot = await this.$LocalNotifications.areEnabled()
      const canSend = await this.$LocalNotifications.requestPermissions()
      console.log('can isNot', isNot)
      console.log('can send', canSend)
      if (canSend) {
        await this.$LocalNotifications.schedule({
          notifications: [
            {
              title: "On sale",
              body: "Widgets are 10% off. Act fast!",
              id: 1,
              schedule: { at: new Date(Date.now() + 1000) },
              actionTypeId: "",
              extra: null
            }
          ]
        })
      }
    }
  }
})
</script>