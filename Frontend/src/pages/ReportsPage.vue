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

//______________________________________________________________
// Reporte Libro Diario Excel
//______________________________________________________________
const reporteDiarioExcel = () => {
  const datos = prepararDatosDiario()
  const ws = XLSX.utils.json_to_sheet(datos, { origin: "A5" })


  const fechaHoy = new Date().toLocaleDateString()
  const encabezado = [
    ["EMPRESA: Comercial ABC S.A. de C.V."],
    ["LIBRO DIARIO"],
    [`Fecha de generación: ${fechaHoy}`],
    [""]
  ]

  XLSX.utils.sheet_add_aoa(ws, encabezado, { origin: "A1" })
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 4 } }
  ]

  if (ws["A1"]) ws["A1"].s = { font: { bold: true }, alignment: { horizontal: "center" } }
  if (ws["A2"]) ws["A2"].s = { font: { bold: true }, alignment: { horizontal: "center" } }
  if (ws["A3"]) ws["A3"].s = { alignment: { horizontal: "center" } }

  ws["!cols"] = [
    { wch: 20 },
    { wch: 10 },
    { wch: 40 },
    { wch: 15 },
    { wch: 15 }
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Libro Diario")
  XLSX.writeFile(wb, "Libro_Diario.xlsx")
}

//______________________________________________________________
// Reporte Libro Diario
//______________________________________________________________
const reporteDiarioHTML = () => {
  const datos = prepararDatosDiario();

  let html = `
<html>
<head>
  <title>Libro Diario</title>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      padding: 40px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f7fa;
      color: #1a202c;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3b82f6;
    }

    h1 {
      color: #1e40af;
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .company-name {
      color: #64748b;
      font-size: 16px;
      margin-bottom: 4px;
    }

    .report-date {
      color: #94a3b8;
      font-size: 14px;
    }

    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3b82f6;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
      transition: all 0.3s ease;
      z-index: 1000;
    }

    .print-button:hover {
      background: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 14px;
    }

    thead tr {
      background: #f1f5f9;
      color: #1e293b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 13px;
    }

    th {
      padding: 14px 12px;
      border-bottom: 2px solid #cbd5e1;
      text-align: left;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
    }

    tbody tr:hover {
      background: #f8fafc;
      transition: 0.2s;
    }

    .right {
      text-align: right;
    }

    .descripcion {
      max-width: 320px;
      white-space: normal;
      color: #475569;
    }

    @media print {
      .print-button {
        display: none;
      }

      body {
        background: white;
        padding: 0;
      }

      .container {
        box-shadow: none;
        padding: 20px;
      }

      table {
        page-break-inside: auto;
      }

      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
    }
  </style>
</head>

<body>
  <button class="print-button" onclick="window.print()">🖨️ Imprimir</button>

  <div class="container">
    <div class="header">
      <div class="company-name">Comercial ABC S.A. de C.V.</div>
      <h1>Libro Diario</h1>
      <div class="report-date">Generado el ${new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}</div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Asiento</th>
          <th>Cuenta</th>
          <th>Descripción</th>
          <th class="right">Debe</th>
          <th class="right">Haber</th>
        </tr>
      </thead>
      <tbody>
  `;

  datos.forEach(d => {
    html += `
      <tr>
        <td>${d.Fecha}</td>
        <td>${d.Asiento}</td>
        <td>${d.Cuenta}</td>
        <td class="descripcion">${d.Descripción}</td>
        <td class="right">$${d.Debe.toFixed(2)}</td>
        <td class="right">$${d.Haber.toFixed(2)}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  </div>

</body>
</html>
  `;

  abrirVentana(html);
};

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

//______________________________________________________________
// Reporte Libro Mayor Excel
//______________________________________________________________
const reporteMayorExcel = () => {
  const cuentas = prepararDatosMayor()
  const filasExcel = []

  Object.keys(cuentas).sort().forEach(codigo => {
    const cta = cuentas[codigo]

    filasExcel.push({
      Fecha: `CUENTA: ${codigo} - ${cta.nombre}`,
      Asiento: '',
      Descripción: '',
      Debe: '',
      Haber: ''
    })

    cta.movimientos.forEach(m => {
      filasExcel.push({
        Fecha: m.fecha,
        Asiento: m.asiento,
        Descripción: m.descripcion,
        Debe: m.debe,
        Haber: m.haber
      })
    })

    filasExcel.push({
      Fecha: 'TOTAL CUENTA',
      Asiento: '',
      Descripción: '',
      Debe: cta.totalDebe,
      Haber: cta.totalHaber
    })

    filasExcel.push({})
  })

  const ws = XLSX.utils.json_to_sheet(filasExcel, { origin: "A5" })
  const fechaHoy = new Date().toLocaleDateString()

  const encabezado = [
    ["EMPRESA: Comercial ABC S.A. de C.V."],
    ["LIBRO MAYOR"],
    [`Fecha de generación: ${fechaHoy}`],
    [""]
  ]

  XLSX.utils.sheet_add_aoa(ws, encabezado, { origin: "A1" })
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } },
    { s: { r: 3, c: 0 }, e: { r: 3, c: 4 } }
  ]

  ws["!cols"] = [
    { wch: 20 },
    { wch: 10 },
    { wch: 40 },
    { wch: 15 },
    { wch: 15 }
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Libro Mayor")
  XLSX.writeFile(wb, "Libro_Mayor.xlsx")
}

//______________________________________________________________
// Reporte Libro Mayor
//______________________________________________________________
const reporteMayorHTML = () => {
  const cuentas = prepararDatosMayor();

  let html = `
<html>
<head>
  <title>Libro Mayor</title>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      padding: 40px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f7fa;
      color: #1a202c;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3b82f6;
    }

    h1 {
      color: #1e40af;
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .company-name {
      color: #64748b;
      font-size: 16px;
      margin-bottom: 4px;
    }

    .report-date {
      color: #94a3b8;
      font-size: 14px;
    }

    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #3b82f6;
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
      transition: all 0.3s ease;
      z-index: 1000;
    }

    .print-button:hover {
      background: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(59, 130, 246, 0.4);
    }

    h3 {
      margin-top: 30px;
      margin-bottom: 16px;
      color: #1e40af;
      font-size: 18px;
      font-weight: 600;
      padding: 12px 16px;
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      border-radius: 4px;
    }

    .cuenta-card {
      background: white;
      padding: 0;
      margin-bottom: 30px;
      page-break-inside: avoid;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      font-size: 14px;
    }

    thead tr {
      background: #f1f5f9;
      color: #1e293b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-size: 13px;
    }

    th {
      padding: 14px 12px;
      border-bottom: 2px solid #cbd5e1;
      text-align: left;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
    }

    tbody tr:hover {
      background: #f8fafc;
      transition: 0.2s;
    }

    .right {
      text-align: right;
    }

    .total-row {
      background: #dbeafe !important;
      font-weight: 600;
      color: #1e40af;
      border-top: 2px solid #3b82f6;
    }

    @media print {
      .print-button {
        display: none;
      }

      body {
        background: white;
        padding: 0;
      }

      .container {
        box-shadow: none;
        padding: 20px;
      }

      .cuenta-card {
        page-break-inside: avoid;
      }

      table {
        page-break-inside: auto;
      }

      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
    }
  </style>
</head>

<body>
  <button class="print-button" onclick="window.print()">🖨️ Imprimir</button>

  <div class="container">
    <div class="header">
      <div class="company-name">Comercial ABC S.A. de C.V.</div>
      <h1>Libro Mayor</h1>
      <div class="report-date">Generado el ${new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}</div>
    </div>
  `;

  Object.keys(cuentas)
    .sort()
    .forEach(codigo => {
      const cta = cuentas[codigo];

      html += `
        <div class="cuenta-card">
          <h3>${codigo} - ${cta.nombre}</h3>

          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Asiento</th>
                <th>Descripción</th>
                <th class="right">Debe</th>
                <th class="right">Haber</th>
              </tr>
            </thead>
            <tbody>
      `;

      cta.movimientos.forEach(m => {
        html += `
          <tr>
            <td>${m.fecha}</td>
            <td>${m.asiento}</td>
            <td>${m.descripcion}</td>
            <td class="right">$${m.debe.toFixed(2)}</td>
            <td class="right">$${m.haber.toFixed(2)}</td>
          </tr>
        `;
      });

      html += `
          <tr class="total-row">
            <td colspan="3" class="right"><strong>TOTAL</strong></td>
            <td class="right"><strong>$${cta.totalDebe.toFixed(2)}</strong></td>
            <td class="right"><strong>$${cta.totalHaber.toFixed(2)}</strong></td>
          </tr>

          </tbody>
        </table>

      </div>
      `;
    });

  html += `
  </div>

</body>
</html>
  `;

  abrirVentana(html);
};

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
