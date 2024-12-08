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
          Censa Árbol (Beta)
        </q-toolbar-title>

        <div v-if="this.currentRoute.fullPath==='/list'">
        <q-checkbox
          v-model="gps"
          dense
          round
          color="info"
          icon="place"
          aria-label="GPS"
          @update:model-value="toggleGPS"
        />
        <q-icon name="place" />GPS</div>
      </q-toolbar>
    </q-header>

    <q-footer elevated style="color:black">
      <q-toolbar>
        <q-btn-group push class="q-mx-auto">
          <!-- q-btn push text-color="black" color="positive" label="Inicio" icon="nature_people" :to="{path: '/'}" / -->
          <q-btn push :disable="this.currentRoute.fullPath==='/list'" text-color="black" color="positive" label="Inventario" icon="list"  :to="{path: '/list'}" />
          <q-btn push :disable="this.currentRoute.fullPath.startsWith('/tree/')" text-color="black" color="positive" label="Nuevo" icon="nature" :to="{path: '/tree/new'}" />
        </q-btn-group>
      </q-toolbar>
    </q-footer>

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

    <q-page-container style="background-image: url('texture.jpg')">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import EssentialLink from 'components/EssentialLink.vue'
import { Motion } from '@capacitor/motion'
import { useStore } from 'vuex'
import { Geolocation } from '@capacitor/geolocation'
import { useRouter } from 'vue-router'

const linksList = [
  {
    title: 'Inicio',
    caption: 'Información general',
    icon: 'nature_people',
    link: '#/'
  },
  {
    title: 'Lista',
    caption: 'Inventario completo',
    icon: 'list',
    link: '#/list'
  },
  {
    title: 'Gestión',
    caption: 'Exportar y gestionar inventarios',
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
    const $router = useRouter()
    const leftDrawerOpen = ref(false)
    let gps = ref(false)
    let motionHandle = {}
    return {
      currentRoute: $router.currentRoute,
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
