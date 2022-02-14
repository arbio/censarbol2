import UTMLatLng from 'utm-latlng'
let utm = new UTMLatLng()
utm.toUTM = utm.convertLatLngToUtm

function nanToZero(x) {
  if (x===undefined)
    return 0
  else
    return x
}

export default {
    inventory:
    [
        { name: 'date', label: 'Fecha', hint: 'Día de Censo', type: 'date', 
          rules: ['date'], mask: 'date' },
        { name: 'name', label: 'Código', hint: 'Identificador único',
          rules: [value=>!!value || 'Campo necesario'] },
        { name: 'location_latitude', label: 'Latitud', hint: 'GPS', recalc:true },
        { name: 'location_longitude', label: 'Longitud', hint: 'GPS', recalc:true },
        { name: 'utm_x', label: 'UTM_X', readonly:true, hidden:true,
          autocalc: tree=>
            utm.toUTM(tree.location_latitude, tree.location_longitude, 2).Easting },
        { name: 'utm_y', label: 'UTM_Y', readonly:true, hidden:true,
          autocalc: tree=>
            utm.toUTM(tree.location_latitude, tree.location_longitude, 2).Northing },
        { name: 'utm_zn', label: 'UTM_ZoneNumber', readonly:true, hidden:true,
          autocalc: tree=>
            utm.toUTM(tree.location_latitude, tree.location_longitude, 2).ZoneNumber },
        { name: 'utm_zl', label: 'UTM_ZoneLetter', readonly:true, hidden:true,
          autocalc: tree=>
            utm.toUTM(tree.location_latitude, tree.location_longitude, 2).ZoneLetter },
        { name: 'especie', label: 'Nombre Común', hint: '', list: 'nombrescomunes' },
        { name: 'cientifico', label: 'Nombre Científico', hint: '', list: 'nombrescientificos' },
        { name: 'circ', label: 'Circunferencia (cm)', hint: '', recalc:true,
          autocalc: tree=>Math.round(nanToZero(tree.dia) * Math.PI * 100)/100 },
        { name: 'alt', label: 'Altura (m)', hint: '' },
        { name: 'dia', label: 'Diámetro (cm)', hint: '', recalc:true,
          autocalc: tree=>Math.round(nanToZero(tree.circ) / Math.PI * 100)/100 },
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