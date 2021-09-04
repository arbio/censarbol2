<template>
<div>
  <q-table
      title="Árboles"
      :rows="rows"
      :columns="columns"
      row-key="name"
      @row-click="editTree"
    />
</div>
</template>
<script>
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { Motion } from '@capacitor/motion'

export default defineComponent({
  setup () {
    const $store = useStore()
    const $router = useRouter()
    const rows = computed({
        get: ()=>$store.state.trees.inventory
    })

    function editTree(row){
        $router.push ('/tree/'+(row.target.parentElement.rowIndex-1))
    }
    return { rows, editTree }
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