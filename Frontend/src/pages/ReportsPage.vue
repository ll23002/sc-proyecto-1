<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Reportes Contables</div>

    <div class="row q-col-gutter-md">
      <div class="col-12 q-mb-md">
        <div class="row q-gutter-sm items-center">
          <div class="col-auto">
            <q-select
              v-model="selectedPeriod"
              :options="periodOptions"
              label="Periodo"
              dense
              outlined
              dark
              emit-value
              map-options
            />
          </div>

          <div class="col-auto">
            <q-input v-model.number="selectedYear" label="Año" type="number" dense outlined dark />
          </div>

          <div class="col-auto" v-if="selectedPeriod === 'mensual'">
            <q-select
              v-model="selectedMonth"
              :options="monthOptions"
              label="Mes"
              dense
              outlined
              dark
              emit-value
              map-options
            />
          </div>

          <div class="col-auto" v-if="selectedPeriod === 'trimestral'">
            <q-select
              v-model="selectedQuarter"
              :options="quarterOptions"
              label="Trimestre"
              dense
              outlined
              dark
              emit-value
              map-options
            />
          </div>

          <div class="col-auto">
            <q-btn color="secondary" label="Aplicar" class="btn-apply" @click="applyFilter" />
            <q-btn flat label="Limpiar" class="q-ml-sm" @click="clearFilter" />
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section><div class="text-h6"><q-icon name="book" /> Libro Diario</div></q-card-section>
          <q-card-section>
            <p>Todas las operaciones</p>
            <div class="q-gutter-sm">
              <q-btn color="positive" label="Excel" icon="table_chart" :loading="loading" @click="generarReporte('DIARIO', 'excel')" />
              <q-btn color="primary" label="HTML" icon="html" :loading="loading" @click="generarReporte('DIARIO', 'html')" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card>
          <q-card-section><div class="text-h6"><q-icon name="account_balance" /> Libro Mayor</div></q-card-section>
          <q-card-section>
            <p>Movimientos agrupados por Cuenta Contable.</p>
            <div class="q-gutter-sm">
              <q-btn color="positive" label="Excel" icon="table_chart" :loading="loading" @click="generarReporte('MAYOR', 'excel')" />
              <q-btn color="primary" label="HTML" icon="html" :loading="loading" @click="generarReporte('MAYOR', 'html')" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import api from 'src/services/api'
import * as XLSX from 'xlsx'

const $q = useQuasar()
const loading = ref(false)
const asientos = ref([])

// --- Filtros de periodo (mensual / trimestral / anual) ---
const periodOptions = [
  { label: 'Todos', value: '' },
  { label: 'Mensual', value: 'mensual' },
  { label: 'Trimestral', value: 'trimestral' },
  { label: 'Anual', value: 'anual' }
]

const monthOptions = [
  { label: 'Enero', value: 1 }, { label: 'Febrero', value: 2 }, { label: 'Marzo', value: 3 },
  { label: 'Abril', value: 4 }, { label: 'Mayo', value: 5 }, { label: 'Junio', value: 6 },
  { label: 'Julio', value: 7 }, { label: 'Agosto', value: 8 }, { label: 'Septiembre', value: 9 },
  { label: 'Octubre', value: 10 }, { label: 'Noviembre', value: 11 }, { label: 'Diciembre', value: 12 }
]

const quarterOptions = [
  { label: '1', value: 1 }, { label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }
]

const selectedPeriod = ref('')
const selectedYear = ref(new Date().getFullYear())
const selectedMonth = ref(null)
const selectedQuarter = ref(null)

const appliedFilter = ref({ period: '', year: null, month: null, quarter: null })

const applyFilter = () => {
  appliedFilter.value = {
    period: selectedPeriod.value || '',
    year: selectedYear.value || null,
    month: selectedMonth.value || null,
    quarter: selectedQuarter.value || null
  }
}

const clearFilter = () => {
  selectedPeriod.value = ''
  selectedYear.value = new Date().getFullYear()
  selectedMonth.value = null
  selectedQuarter.value = null
  appliedFilter.value = { period: '', year: null, month: null, quarter: null }
}

const filteredAsientos = computed(() => {
  const { period, year, month, quarter } = appliedFilter.value
  if (!period) return asientos.value

  return asientos.value.filter(a => {
    if (!a.fecha) return false
    const d = new Date(a.fecha)
    if (Number.isNaN(d.getTime())) return false
    const ay = d.getFullYear()
    if (period === 'anual') {
      if (!year) return true
      return ay === parseInt(year)
    }
    if (period === 'mensual') {
      if (!year || !month) return false
      return ay === parseInt(year) && (d.getMonth() + 1) === parseInt(month)
    }
    if (period === 'trimestral') {
      if (!year || !quarter) return false
      const aq = Math.ceil((d.getMonth() + 1) / 3)
      return ay === parseInt(year) && aq === parseInt(quarter)
    }
    return true
  })
})

const cargarDatos = async () => {
  try {
    loading.value = true
    const response = await api.getAsientosContables()
    asientos.value = response.data
    return true
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Error cargando asientos contables' })
    return false
  } finally {
    loading.value = false
  }
}

const generarReporte = async (tipo, formato) => {
  const exito = await cargarDatos()
  if (!exito || filteredAsientos.value.length === 0) {
    $q.notify({ type: 'warning', message: 'No hay datos contables para generar reportes' })
    return
  }

  if (tipo === 'DIARIO') {
    if (formato === 'excel') reporteDiarioExcel()
    else reporteDiarioHTML()
  } else if (tipo === 'MAYOR') {
    if (formato === 'excel') reporteMayorExcel()
    else reporteMayorHTML()
  }
}

const prepararDatosDiario = () => {
  const filas = []
  filteredAsientos.value.forEach(asiento => {
    asiento.detalles.forEach(detalle => {
      filas.push({
        Fecha: asiento.fecha,
        Asiento: asiento.numero_asiento,
        Cuenta: `${detalle.codigo_cuenta} - ${detalle.nombre_cuenta}`,
        Descripción: detalle.descripcion,
        Debe: Number(detalle.debe),
        Haber: Number(detalle.haber)
      })
    })
  })
  return filas
}

const reporteDiarioExcel = () => {
  const datos = prepararDatosDiario()
  const ws = XLSX.utils.json_to_sheet(datos)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Libro Diario")
  XLSX.writeFile(wb, "Libro_Diario.xlsx")
}

const reporteDiarioHTML = () => {
  const datos = prepararDatosDiario()
  let html = `
    <html><head><title>Libro Diario</title>
    <style>table {width: 100%; border-collapse: collapse;} th, td {border: 1px solid #ddd; padding: 8px;} th {background-color: #f2f2f2;}</style>
    </head><body><h1>Libro Diario</h1><table>
    <thead><tr><th>Fecha</th><th>Asiento</th><th>Cuenta</th><th>Descripción</th><th>Debe</th><th>Haber</th></tr></thead><tbody>`

  datos.forEach(d => {
    html += `<tr><td>${d.Fecha}</td><td>${d.Asiento}</td><td>${d.Cuenta}</td><td>${d.Descripción}</td>
             <td align="right">$${d.Debe.toFixed(2)}</td><td align="right">$${d.Haber.toFixed(2)}</td></tr>`
  })
  html += '</tbody></table></body></html>'
  abrirVentana(html)
}

const prepararDatosMayor = () => {
  const cuentas = {}

  filteredAsientos.value.forEach(asiento => {
    asiento.detalles.forEach(detalle => {
      const codigo = detalle.codigo_cuenta
      if (!cuentas[codigo]) {
        cuentas[codigo] = { nombre: detalle.nombre_cuenta, movimientos: [], totalDebe: 0, totalHaber: 0 }
      }
      cuentas[codigo].movimientos.push({
        fecha: asiento.fecha,
        asiento: asiento.numero_asiento,
        descripcion: detalle.descripcion,
        debe: Number(detalle.debe),
        haber: Number(detalle.haber)
      })
      cuentas[codigo].totalDebe += Number(detalle.debe)
      cuentas[codigo].totalHaber += Number(detalle.haber)
    })
  })
  return cuentas
}

const reporteMayorExcel = () => {
  const cuentas = prepararDatosMayor()
  const filasExcel = []

  Object.keys(cuentas).sort().forEach(codigo => {
    const cta = cuentas[codigo]
    filasExcel.push({ Fecha: `CUENTA: ${codigo} - ${cta.nombre}`, Asiento: '', Descripción: '', Debe: '', Haber: '' })
    cta.movimientos.forEach(m => {
      filasExcel.push({
        Fecha: m.fecha, Asiento: m.asiento, Descripción: m.descripcion,
        Debe: m.debe, Haber: m.haber
      })
    })
    filasExcel.push({
      Fecha: 'TOTAL CUENTA', Asiento: '', Descripción: '',
      Debe: cta.totalDebe, Haber: cta.totalHaber
    })
    filasExcel.push({})
  })

  const ws = XLSX.utils.json_to_sheet(filasExcel)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Libro Mayor")
  XLSX.writeFile(wb, "Libro_Mayor.xlsx")
}

const reporteMayorHTML = () => {
  const cuentas = prepararDatosMayor()
  let html = `<html><head><title>Libro Mayor</title>
    <style>
      body { font-family: sans-serif; }
      table {width: 100%; border-collapse: collapse; margin-bottom: 20px;}
      th, td {border: 1px solid #ddd; padding: 6px;}
      .header-cta { background: #e3f2fd; font-weight: bold; }
      .total-row { background: #f5f5f5; font-weight: bold; }
    </style></head><body><h1>Libro Mayor</h1>`

  Object.keys(cuentas).sort().forEach(codigo => {
    const cta = cuentas[codigo]
    html += `<h3>${codigo} - ${cta.nombre}</h3>
      <table><thead><tr><th>Fecha</th><th>Asiento</th><th>Descripción</th><th>Debe</th><th>Haber</th></tr></thead><tbody>`

    cta.movimientos.forEach(m => {
      html += `<tr><td>${m.fecha}</td><td>${m.asiento}</td><td>${m.descripcion}</td>
               <td align="right">$${m.debe.toFixed(2)}</td><td align="right">$${m.haber.toFixed(2)}</td></tr>`
    })

    html += `<tr class="total-row"><td colspan="3" align="right">TOTAL</td>
             <td align="right">$${cta.totalDebe.toFixed(2)}</td><td align="right">$${cta.totalHaber.toFixed(2)}</td></tr>`
    html += `</tbody></table>`
  })

  html += '</body></html>'
  abrirVentana(html)
}

const abrirVentana = (html) => {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}
</script>

<style scoped>
.btn-apply {
  background-color: #0b5fff !important;
  color: #ffffff !important;
  border-color: transparent !important;
}
.btn-apply:hover {
  background-color: #094edd !important;
}
</style>
