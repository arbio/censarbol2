export function saveTree(state, treeData) {
    // Request persistent storage for site
    if (navigator.storage && navigator.storage.persist) {
      async function asktoPersist() {
        const isPersisted = await navigator.storage.persist();
        console.log(`Persisted storage granted: ${isPersisted}`);
      }
      asktoPersist()
    }
    if (state.inventory.filter((item)=>item.name==treeData.name).length > 0) {
      let item = state.inventory.find((item)=>item.name==treeData.name)
      Object.assign(item, treeData)
    }
    else {
      state.inventory.push(Object.assign({}, treeData))
    }
    localStorage.setItem('inventory', JSON.stringify(state.inventory))
}

export function addLocationPoint(state, location) {
  if (location) {
    state.location_data.push(location)
  }
}

export function addOrientationData(state, orientation) {
    state.motion_data.splice(0, state.motion_data.length - 10)
    state.motion_data.push(orientation)
}

export function setWatchId(state, callbackID) {
  state.watch_id = callbackID
}

export function removeTree(state, treeName) {
  const removeIndex = state.inventory.findIndex(tree => tree.name === treeName)
  state.inventory.splice(removeIndex, 1)
}
