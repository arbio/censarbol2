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
        hint="Especie y ID"
        lazy-rules
        :rules="[ val => val && val.length > 0 || 'Please type something']"
      />
    </q-form>
     <button @click="getCurrentPosition">
      Get Current Location
    </button>


    <q-page-sticky position="bottom-left" :offset="[18, 18]">
      <q-btn fab icon="west" color="positive" :to="{path: '/'}" />
    </q-page-sticky>
</q-page>
</template>

<script>
import { defineComponent, onMounted, ref } from 'vue';
import { Geolocation } from '@capacitor/geolocation';
import { Plugins } from '@capacitor/core';


export default defineComponent({
  name: 'TreeForm',
  data: () => {
    return {
      name: "Uno"
    }
  },
  methods: {
    onSubmit: ()=>{
      console.log("submitted")
    }
  },
  setup() {
    const getCurrentPosition = async () => {
      const pos = await Geolocation.getCurrentPosition();
      console.log(pos)
    };
    return { getCurrentPosition }
  }
})
</script>