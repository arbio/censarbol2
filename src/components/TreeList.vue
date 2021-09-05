<template>
<div>
  <q-table
      title="Árboles"
      :rows="rows"
      :columns="columns"
      row-key="name"
      @row-click="editTree"
    >
     <template v-slot:body-cell-dist="props">
        <q-td :props="props">
            {{ calcDist(props.row) }} Km.
        </q-td>
      </template>
    </q-table>
</div>
</template>
<script>
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { Motion } from '@capacitor/motion'
import { distance } from '../../util.js'

export default defineComponent({
  setup () {
    const $store = useStore()
    const $router = useRouter()
    const rows = $store.state.trees.inventory

    function editTree(row){
        $router.push ('/tree/'+(row.target.parentElement.rowIndex-1))
    }
    function calcDist(row){
        if (row.location_latitude &&
            row.location_longitude &&
            $store.state.trees.location_data.length > 0) {
          let lastLocation = $store.state.trees.location_data [$store.state.trees.location_data.length - 1]
          return Math.round(distance(row.location_latitude, row.location_longitude,
                        lastLocation.coords.latitude, lastLocation.coords.longitude, 'K')*100)/100
        }
        else {
          return '?'
        }
    }
    return { rows, editTree, calcDist }
  },
  name: 'TreeList',
  props: {
      title: {
          type: String
      }
  },
  computed: {
      columns: ()=>[
          {name: 'name', label: "ID", field: 'name'},
          {name: 'alt', label: "Alt.", field: 'alt'},
          {name: 'dir', label: "Dir.", classes: (row)=>'dir' + row.name },
          {name: 'dist', label: "Dist."}
      ]
  }
})

</script>