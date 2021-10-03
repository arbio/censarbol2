<template>
  <q-page class="flex flex-center">
    <TreeList title="Árboles" v-show="trees_exist"></TreeList>

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

export default defineComponent({
  name: 'PageIndex',
  components: { TreeList },
  setup: function () {
    const $store = useStore()
    const $router = useRouter()
    const trees_exist = computed({
      get: () => ($store.state.trees.inventory.length > 0)
    })
    if (!trees_exist.value) {
      $router.push ('/')
    }
    return { trees_exist }
  }
})
</script>
