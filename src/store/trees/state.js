

export default function () {
  return {
    inventory_: JSON.parse(localStorage.getItem('inventory')) || [],
    inventory: [
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
