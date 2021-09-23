<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated style="color: black">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Censa Árbol
        </q-toolbar-title>

        <div>

        <q-toggle
          v-model="gps"
          dense
          round
          icon="share_location"
          aria-label="GPS"
          @update:model-value="toggleGPS"
        />

          Arbio</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
          class="text-grey-8"
        >
          Inventario de Árboles
        </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container style="background-color: #304533">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'
import { Motion } from '@capacitor/motion'
import { useStore } from 'vuex'
import { Geolocation } from '@capacitor/geolocation'

const linksList = [
  {
    title: 'Inicio',
    caption: 'Información general',
    icon: 'favorite',
    link: '#'
  },
  {
    title: 'Lista',
    caption: 'Inventario completo',
    icon: 'list',
    link: '#'
  },
  {
    title: 'Exportar',
    caption: 'Descargar inventario y fotos',
    icon: 'publish',
    link: '#/export'
  },
  {
    title: 'Código Fuente',
    caption: 'Adapta esta aplicación',
    icon: 'code',
    link: 'https://gitlab.com/fuentelibre/censaarbol2'
  }
];

import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink
  },

  setup () {
    const $store = useStore()
    const leftDrawerOpen = ref(false)
    let gps = ref(false)
    let motionHandle = {}
    return {
      essentialLinks: linksList,
      gps,
      motionHandle,
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
      async toggleGPS () {
        if (gps.value) {
          console.log("enable")
          motionHandle = await Motion.addListener('orientation', event => {
            $store.commit("trees/addOrientationData", event)
	        })
          let callbackID = await Geolocation.watchPosition({
            enableHighAccuracy: true,
            timeout: 250},
            (e)=>$store.commit('trees/addLocationPoint', e)
          )
          $store.commit('trees/setWatchId', callbackID)
        }
        else {
          console.log("disable")
          motionHandle.remove()
          Geolocation.clearWatch({
            'id': $store.state.trees.watch_id
          })
        }
      }
    }
  }
})
</script>
