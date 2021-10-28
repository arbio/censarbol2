<template>
  <q-page class="flex flex-center column">
    <q-card><q-input
        v-model="search"
        filled
        type="search"
        placeholder="Buscar"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
      </q-card>
      <q-separator />
    <TreeList title="Árboles" v-show="trees_exist" :filter="search"></TreeList>

    <!-- q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab icon="add" color="positive" :to="{path: '/tree/new'}" />
    </q-page-sticky -->
  </q-page>
</template>

<script>
import TreeList from 'components/TreeList.vue'
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

export default defineComponent({
  name: 'PageIndex',
  components: { TreeList },
  setup: function () {
    const $store = useStore()
    const $router = useRouter()
    let search = ref('')
    const trees_exist = computed({
      get: () => ($store.state.trees.inventory.length > 0)
    })
    if (!trees_exist.value) {
      $router.push ('/')
    }
    return { trees_exist, search }
  }
})
</script>
