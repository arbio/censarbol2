export default {
    inventory:
    [
        { name: 'date', label: 'Fecha', hint: 'Día de Censo', type: 'date', 
          rules: ['date'], mask: 'date' },
        { name: 'name', label: 'Individuo', hint: 'Identificador único',
          rules: [value=>!!value || 'Campo necesario'] },
        { name: 'location_latitude', label: 'Latitud', hint: 'GPS' },
        { name: 'location_longitude', label: 'Longitud', hint: 'GPS' },
        { name: 'especie', label: 'Nombre Común', hint: '', list: 'nombrescomunes' },
        { name: 'cientifico', label: 'Nombre Científico', hint: '', list: 'nombrescientificos' },
        { name: 'circ', label: 'Circunferencia (cm)', hint: '', recalc: true },
        { name: 'alt', label: 'Altura (m)', hint: '' },
        { name: 'dia', label: 'Diámetro (cm)', hint: '', readonly: true,
          autocalc: tree=>Math.round(tree.circ / Math.PI * 100)/100 },
        { name: 'relevancia', label: 'Relevancia', hint: '', type: 'option', readonly:true,
          options: [
            { label: 'Medicinal',
              value: 'Medicinal'},
            { label: 'Maderable',
              value: 'Maderable'},
            { label: 'Ornamental',
              value: 'Ornamental'},
            { label: 'Frutal',
              value: 'Frutal'},
            { label: 'Sagrado',
              value: 'Sagrado'},
            { label: 'Majestuoso',
              value: 'Majestuoso'},
            { label: 'Fauna Silvestre',
              value: 'Fauna'},

          ]
        },
        { name: 'obs', label: 'Observaciones', hint: '', type: 'textarea'},
    ]
}