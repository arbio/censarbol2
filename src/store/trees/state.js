

export default function () {
  return {
    location_data: [],
    motion_data: [],
    watch_id: [],   /* for geolocation CallbackID */
    inventory: JSON.parse(localStorage.getItem('inventory')) || [],
    inventory_: [
      {
        name: 'ceiba',
        cientifico: 'cientifi',
        especie: 'comun',
        alt: '32',
        circ: '120'
      },
      {
        name: 'bambu',
        cientifico: 'cientifi',
        especie: 'comun',
        alt: '32',
        circ: '120'
      },
      {
        name: 'limón',
        cientifico: 'cientifi',
        especie: 'comun',
        alt: '32',
        circ: '120'
      }
    ]
  }
}
