export function saveTree(state, treeData) {
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
    console.log('New Geolocation Point!', location, state)
    state.location_data.push(location)
}

export function addOrientationData(state, orientation) {
    state.motion_data.push(orientation)
    state.motion_data.splice(10)
}
