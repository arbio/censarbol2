<template>
  <q-table
      title="Árboles"
      :rows="rows"
      :columns="columns"
      row-key="name"
      @row-click="editTree"
      :hide-pagination="true"
      :pagination="{sortBy: 'dist',
                    rowsPerPage: 0 }"
    >
     <template v-slot:body-cell-dir="props">
        <q-td :props="props">
            <q-knob
                readonly
                v-if="calcBearing(props.row)"
                v-show="calcDist(props.row)>=0.02"
                :angle="calcBearing(props.row)"
                v-model="one"
                size="50px"
                :thickness="0.22"
                color="yellow"
                track-color="brown"
                class="q-ma-md"
                />
            <q-icon
                v-show="calcDist(props.row)<0.02 && calcDist(props.row)>=0.01"
                 class="text-orange" style="font-size: 4em;"
                name="gps_fixed" /> 
            <q-icon
                v-show="calcDist(props.row)<0.01 && calcDist(props.row)>=0"
                 class="text-green" style="font-size: 4em;"
                name="gps_fixed" /> 
        </q-td>
      </template>
     <template v-slot:body-cell-dist="props">
        <q-td :props="props">
          <q-label v-show="calcDist(props.row)<1">
            <i>{{ calcDist(props.row) * 1000 }} m.</i>
          </q-label>
          <q-label v-show="calcDist(props.row)>=1">
            {{ calcDist(props.row) }} Km.
          </q-label>
        </q-td>
      </template>
    </q-table>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { distance, bearing } from '../util.js'

export default defineComponent({
  setup (props) {
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
          if ($store.state.trees.motion_data.length > 0) {
            return north_bearing + $store.state.trees.motion_data.slice(-1)[0].alpha - 180
          }
          return north_bearing
        }
        else {
          return false
        }
    }
    let one = 2

    let columns = computed(
        ()=>[
            {name: 'name', label: "ID", field: 'name', sortable: true},
            {name: 'alt', label: "Diá.", field: 'dia', sortable: true},
            {name: 'dir', label: "Dir.", field: 'dir', align: 'center'},
            {name: 'dist', label: "Dist.", sortable: true, 
            'field': calcDist,
            'sort': (a, b) => parseFloat(a, 10) - parseFloat(b, 10)}
        ]
    )
    return { one, rows, editTree, calcDist, calcBearing, columns }
  },
  name: 'TreeList',
  props: {
      title: {
          type: String
      }
  }
})

</script>
<style>
.q-table__top {
    align-self: center;
}
</style>
