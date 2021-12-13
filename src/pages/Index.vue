<template>
  <q-page class="flex flex-center">
    <q-img
      alt="Censarbol logo"
      src="~assets/censarbol.png"
      style="width: 354px; height: 396px"
    >
    <div class="absolute-full text-subtitle2 flex flex-center column">
      <h2>Inventario</h2>
      <q-badge class="text-h3"
              color="info"
              transparent
              v-if="trees_exist"
              :label="$store.state.trees.inventory.length + ' registros'"
      />
      <div class="flex flex-center column" v-if="!trees_exist">
      <div class="q-ma-md text-center">
        Inicia el inventario con un nuevo registro.
      </div>
      <q-badge class="text-h2"
              color="accent"
              transparent
      >
      <q-icon name="south_east" />
      </q-badge>
      </div>
    </div>

    </q-img>
    <!-- q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="positive" :to="{path: '/tree/new'}" />
    </q-page-sticky -->
  </q-page>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'PageIndex',
  setup: function () {
    const $store = useStore()
    const trees_exist = computed({
      get: () => ($store.state.trees.inventory.length > 0)
    })
    return { trees_exist }
  }
})
</script>
