<template>
<div>
  <q-table
      title="Árboles"
      :rows="rows"
      :columns="columns"
      row-key="name"
      @row-click="editTree"
    >
     <template v-slot:body-cell-dir="props">
        <q-td :props="props">
            <q-knob
                readonly
                v-if="calcBearing(props.row)"
                :angle="180+calcBearing(props.row)"
                v-model="one"
                size="50px"
                :thickness="0.22"
                color="yellow"
                track-color="brown"
                class="q-ma-md"
                />
        </q-td>
      </template>
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
import { distance, bearing } from '../../util.js'

export default defineComponent({
  setup () {
    const $store = useStore()
    const $router = useRouter()
    const rows = $store.state.trees.inventory

    function editTree(target,tree){
        $router.push ('/tree/'+tree.name)
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
    function calcBearing(row) {
        if (row.location_latitude &&
            row.location_longitude &&
            $store.state.trees.location_data.length > 0) {
          let lastLocation = $store.state.trees.location_data [$store.state.trees.location_data.length - 1]
          const north_bearing = bearing(row.location_latitude, row.location_longitude,
                        lastLocation.coords.latitude, lastLocation.coords.longitude) - 1
          if (Array.isArray($store.state.trees.motion_data)) {
            console.log(north_bearing, $store.state.motion_data[$store.state.trees.motion_data.length -1])
            console.log("Adjusting for motion")
            return north_bearing + $store.state.trees.motion_data.slice(-1) - 180
          }
          return north_bearing
        }
        else {
          return false
        }
    }
    let one = 2
    return { one, rows, editTree, calcDist, calcBearing }
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
          {name: 'dir', label: "Dir.", align: 'center'},
          {name: 'dist', label: "Dist."}
      ]
  }
})

</script>
<style>
.q-table__top {
    align-self: center;
}
</style>
