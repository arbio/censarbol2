<template>
  <q-page class="flex flex-center">
    <img
      alt="Censarbol logo"
      src="~assets/censarbol.png"
      style="width: 354px; height: 396px"
      v-show="!trees_exist"
    >
    <TreeList v-show="trees_exist"></TreeList>
  </q-page>
</template>

<script>
import TreeList from 'components/TreeList.vue';
import { defineComponent } from 'vue';
import store from '../store/index';

console.log(store.trees)

export default defineComponent({
  name: 'PageIndex',
  components: { TreeList },
  computed: {
    trees_exist: ()=>(store.trees.length>0)
  }
})
</script>
