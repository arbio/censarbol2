<template>
<q-page class="flex flex-center">
    
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
      <q-input
        filled
        v-model="location.latitude"
        label="Latitud"
        hint="GPS"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Escribe algo porfavor']"
      />
      <q-input
        filled
        v-model="location.longitude"
        label="Longitud"
        hint="GPS"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Escribe algo porfavor']"
      />
    </q-form>

    <q-page-sticky position="bottom-left" :offset="[18, 18]">
      <q-btn fab icon="west" color="positive" :to="{path: '/'}" />
    </q-page-sticky>
</q-page>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue';
import { Geolocation } from '@capacitor/geolocation';

export default defineComponent({
  name: 'TreeForm',
  data: () => {
    return {
      name: "Uno",
      especie: "Dos",
      cientifico: "Tres",
      location: {
          latitude: '',
          longitude: ''
      }
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