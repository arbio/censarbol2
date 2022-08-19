import UTMLatLng from 'utm-latlng'
import species from './species.json'

let utm = new UTMLatLng()
utm.toUTM = utm.convertLatLngToUtm

function nanToZero(x) {
  if (x===undefined)
    return 0
  else
    return x
}
function speciesFromTree(tree) {
  let especie = species.filter(item=>item[1]==tree.cientifico)
  if (especie.length!=0)
    return especie[0][0]
  else
    return tree.especie
}
function scientificFromTree(tree) {
  let especie = species.filter(item=>item[0]==tree.especie)
  if (especie.length!=0)
    return especie[0][1]
  else
    return tree.cientifico
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
        { name: 'especie', label: 'Nombre Común', hint: '', list: 'nombrescomunes', recalc:true,
          autocalc: speciesFromTree},
        { name: 'cientifico', label: 'Nombre Científico', hint: '', list: 'nombrescientificos', recalc:true,
          autocalc: scientificFromTree},
        { name: 'circ', label: 'Circunferencia (cm)', hint: '', recalc:true,
          autocalc: tree=>Math.round(nanToZero(tree.dia) * Math.PI * 100)/100 },
        { name: 'alt', label: 'Altura (m)', hint: '' },
        { name: 'dia', label: 'Diámetro (cm)', hint: '', recalc:true,
          autocalc: tree=>Math.round(nanToZero(tree.circ) / Math.PI * 100)/100 },
        { name: 'fenologia', label: 'Fenología', hint: '', type: 'option', readonly:true,
          options: [
            { label: 'Floración',
              value: 'Floracion'},
            { label: 'Fructificación',
              value: 'Fructificacion'},
            { label: 'Caída de hojas',
              value: 'Caida_de_hojas'},
          ]
        },
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
              value: 'Fauna_Silvestre'},

          ]
        },
        { name: 'regen', label: 'Regeneración', hint: 'Colocar número' },
        { name: 'obs', label: 'Observaciones', hint: '', type: 'textarea'},
        { name: 'circ2', label: '2da Circunferencia (cm)', hint: '', recalc:true,
          autocalc: tree=>Math.round(nanToZero(tree.dia2) * Math.PI * 100)/100 },
        { name: 'dia2', label: '2do Diámetro (cm)', hint: '', recalc:true,
          autocalc: tree=>Math.round(nanToZero(tree.circ2) / Math.PI * 100)/100 },
    ]
}
