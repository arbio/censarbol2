<template>
<div>
  <q-table
      title="Árboles"
      :rows="rows"
      :columns="columns"
      row-key="name"
    />
</div>
</template>
<script>
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'

export default defineComponent({
  setup () {
    const $store = useStore()
    const rows = computed({
        get: ()=>$store.state.trees.inventory
    })

    return { rows }
  },
  name: 'TreeList',
  props: {
      title: {
          type: String
      }
  },
  computed: {
      columns: ()=>[
          {label: "ID", field: 'name'},
          {label: "Alt.", field: 'alt'},
          {label: "Dir."},
          {label: "Dist."}
      ]
  }
})

</script>