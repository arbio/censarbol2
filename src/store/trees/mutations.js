export function saveTree(state, treeData) {
    console.log(state.inventory.filter((item)=>item.name==treeData.name))
    if (state.inventory.filter((item)=>item.name==treeData.name).length > 0) {
      let item = state.inventory.find((item)=>item.name==treeData.name)
      Object.assign(item, treeData)
      console.log('repeat')
    }
    else {
      state.inventory.push(Object.assign({}, treeData))
    }
}
