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
import store from '../store/index';
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TreeList',
  props: {
      title: {
          type: String
      }
  },
  computed: {
      columns: ()=>[
          {label: "ID"},
          {label: "Alt."},
          {label: "Dir."},
          {label: "Dist."}
      ],
      rows: ()=>
          store.trees
  }
})

</script>