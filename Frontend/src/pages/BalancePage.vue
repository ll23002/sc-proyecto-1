<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Validación de Balance Contable</div>

    <!-- Banner de estado del backend -->
    <BackendStatusBanner :backend-status="backendStatus" :error="error" @check="checkBackendStatus" />

    <!-- Detalles Acumulados desde TransactionsPage -->
    <q-card v-if="detallesAcumulados.length > 0" class="q-mb-md">
      <q-card-section>
        <div class="row justify-between items-center q-mb-md">
          <div class="text-h6">📋 Detalles Acumulados para Validar</div>
          <div class="q-gutter-sm">
            <q-btn color="primary" label="Recargar" icon="refresh" @click="cargarDetalles" flat dense />
            <q-btn color="positive" label="Exportar Excel" icon="table_chart" @click="exportarDetallesExcel" flat dense />
            <q-btn color="primary" label="Exportar HTML" icon="print" @click="exportarDetallesHTML" flat dense />
          </div>
        </div>

        <div class="q-mb-md">
          <q-banner class="bg-info text-white">
            <div class="row items-center q-gutter-md">
              <div>
                <div class="text-caption">Total Debe</div>
                <div class="text-h6">{{ formatCurrency(totalDebe) }}</div>
              </div>
              <div>
                <div class="text-caption">Total Haber</div>
                <div class="text-h6">{{ formatCurrency(totalHaber) }}</div>
              </div>
              <div>
                <div class="text-caption">Estado</div>
                <div class="text-h6">
                  {{ esBalanceado ? '✓ Balanceado' : '✗ No balanceado' }}
                </div>
              </div>
              <div v-if="!esBalanceado">
                <div class="text-caption">Diferencia</div>
                <div class="text-h6 text-negative">{{ formatCurrency(Math.abs(totalDebe - totalHaber)) }}</div>
              </div>
            </div>
          </q-banner>
        </div>

        <q-table
          :rows="detallesAcumulados"
          :columns="detallesColumns"
          row-key="id"
          flat
          bordered
          :pagination="{ rowsPerPage: 0 }"
        >
          <template v-slot:body-cell-debe="props">
            <q-td :props="props">{{ formatCurrency(props.row.debe) }}</q-td>
          </template>
          <template v-slot:body-cell-haber="props">
            <q-td :props="props">{{ formatCurrency(props.row.haber) }}</q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Mensaje si no hay detalles acumulados -->
    <q-card v-else class="q-mb-md">
      <q-card-section>
        <div class="text-center q-pa-md text-grey">
          <q-icon name="info" size="3em" class="q-mb-md" />
          <div class="text-h6">No hay detalles acumulados</div>
          <div class="text-caption">Ve a la página de Transacciones y agrega detalles para validar aquí</div>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md">
      <q-card-section>
        <p>El balance contable es correcto cuando la suma del Debe es igual a la suma del Haber.</p>
        <q-btn
          color="primary"
          label="Validar Balance desde Backend"
          icon="check_circle"
          :loading="loading"
          @click="validateBalance"
        />
      </q-card-section>
    </q-card>

    <!-- Resultado de Validación -->
    <q-card v-if="validationResult" class="q-mb-md">
      <q-card-section>
        <div class="text-h6">
          <q-icon
            :name="validationResult.balanced ? 'check_circle' : 'error'"
            :color="validationResult.balanced ? 'positive' : 'negative'"
            size="md"
          />
          {{ validationResult.balanced ? 'Balance Correcto' : 'Balance Incorrecto' }}
        </div>

        <div class="q-mt-md row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-caption">Total Debe</div>
                <div class="text-h5 text-primary">
                  {{ formatCurrency(validationResult.debe) }}
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-caption">Total Haber</div>
                <div class="text-h5 text-secondary">
                  {{ formatCurrency(validationResult.haber) }}
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card flat bordered>
              <q-card-section>
                <div class="text-caption">Diferencia</div>
                <div
                  class="text-h5"
                  :class="validationResult.balanced ? 'text-positive' : 'text-negative'"
                >
                  {{ formatCurrency(Math.abs(validationResult.difference)) }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Errores Detectados -->
    <q-card v-if="validationResult && validationResult.errors.length > 0">
      <q-card-section>
        <div class="text-h6 text-negative"><q-icon name="warning" /> Errores Detectados</div>
        <q-list bordered separator class="q-mt-md">
          <q-item v-for="(error, index) in validationResult.errors" :key="index">
            <q-item-section avatar>
              <q-icon name="error" color="negative" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ error }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Mensaje cuando no hay errores -->
    <q-card
      v-if="validationResult && validationResult.errors.length === 0 && validationResult.balanced"
    >
      <q-card-section class="bg-positive text-white">
        <div class="text-h6"><q-icon name="check_circle" /> ¡Perfecto!</div>
        <p>No se detectaron errores en las transacciones y el balance cuadra correctamente.</p>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useTransactions } from 'src/composables/useTransactions'
import { useBackendStatus } from 'src/composables/useBackendStatus'
import BackendStatusBanner from 'src/components/BackendStatusBanner.vue'

const $q = useQuasar()
const { fetchTransactions, validateBalance: validateBalanceComposable, loading } = useTransactions()
const { backendStatus, error, checkBackendStatus, startMonitoring, stopMonitoring } = useBackendStatus()
const validationResult = ref(null)

// Detalles acumulados desde localStorage
const detallesAcumulados = ref([])

// Columnas para la tabla de detalles
const detallesColumns = [
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'debe', label: 'Debe', field: 'debe', align: 'right' },
  { name: 'haber', label: 'Haber', field: 'haber', align: 'right' }
]

// Computed para totales
const totalDebe = computed(() => {
  return detallesAcumulados.value.reduce((sum, d) => sum + (parseFloat(d.debe) || 0), 0)
})

const totalHaber = computed(() => {
  return detallesAcumulados.value.reduce((sum, d) => sum + (parseFloat(d.haber) || 0), 0)
})

const esBalanceado = computed(() => {
  return Math.abs(totalDebe.value - totalHaber.value) < 0.01
})

// Cargar detalles desde localStorage
const cargarDetalles = () => {
  try {
    const data = localStorage.getItem('detalles_acumulados')
    if (data) {
      const parsed = JSON.parse(data)
      if (parsed.detalles && Array.isArray(parsed.detalles)) {
        detallesAcumulados.value = parsed.detalles

        $q.notify({
          color: 'positive',
          message: `${parsed.detalles.length} detalles cargados`,
          position: 'top',
          icon: 'check',
          timeout: 2000
        })
      }
    } else {
      detallesAcumulados.value = []
    }
  } catch (e) {
    console.error('Error cargando detalles:', e)
    $q.notify({
      color: 'negative',
      message: 'Error al cargar detalles',
      position: 'top'
    })
  }
}

// Exportar detalles a Excel
const exportarDetallesExcel = () => {
  try {
    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.json_to_sheet(
        detallesAcumulados.value.map(d => ({
          'Descripción': d.descripcion,
          'Debe': parseFloat(d.debe || 0),
          'Haber': parseFloat(d.haber || 0)
        }))
      )

      // Agregar fila de totales
      XLSX.utils.sheet_add_json(ws, [
        {
          'Descripción': 'TOTAL',
          'Debe': totalDebe.value,
          'Haber': totalHaber.value
        }
      ], { skipHeader: true, origin: -1 })

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Detalles')

      const fecha = new Date().toISOString().split('T')[0]
      XLSX.writeFile(wb, `detalles_balance_${fecha}.xlsx`)

      $q.notify({
        color: 'positive',
        message: 'Excel exportado exitosamente',
        position: 'top',
        icon: 'download'
      })
    })
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Error al exportar: ' + error.message,
      position: 'top'
    })
  }
}

// Exportar detalles a HTML
const exportarDetallesHTML = () => {
  try {
    const fecha = new Date().toLocaleDateString('es-SV')

    let rows = ''
    detallesAcumulados.value.forEach(d => {
      rows += `<tr>
        <td>${d.descripcion || ''}</td>
        <td style="text-align: right;">${formatCurrency(d.debe)}</td>
        <td style="text-align: right;">${formatCurrency(d.haber)}</td>
      </tr>`
    })

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Detalles de Balance - ${fecha}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { text-align: center; color: #333; }
    .info { text-align: center; color: #666; margin-bottom: 20px; }
    .balance-info {
      background: ${esBalanceado.value ? '#c8e6c9' : '#ffcdd2'};
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
    }
    .no-print { text-align: center; margin: 20px 0; }
    .print-btn { background-color: #4CAF50; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
    .print-btn:hover { background-color: #45a049; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 12px; }
    th { background-color: #4CAF50; color: white; text-align: left; font-weight: bold; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    .total-row { background-color: #e0e0e0; font-weight: bold; }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="print-btn" onclick="window.print()">🖨️ Imprimir</button>
  </div>
  <h1>Detalles de Balance Contable</h1>
  <div class="info">Fecha de generación: ${fecha}</div>
  <div class="balance-info">
    ${esBalanceado.value ? '✓ BALANCE CORRECTO' : '✗ BALANCE INCORRECTO'}<br>
    Debe: ${formatCurrency(totalDebe.value)} | Haber: ${formatCurrency(totalHaber.value)}
    ${!esBalanceado.value ? `<br>Diferencia: ${formatCurrency(Math.abs(totalDebe.value - totalHaber.value))}` : ''}
  </div>
  <table>
    <thead>
      <tr>
        <th>Descripción</th>
        <th>Debe</th>
        <th>Haber</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="total-row">
        <td>TOTAL</td>
        <td style="text-align: right;">${formatCurrency(totalDebe.value)}</td>
        <td style="text-align: right;">${formatCurrency(totalHaber.value)}</td>
      </tr>
    </tbody>
  </table>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const newWindow = window.open(url, '_blank')

    if (!newWindow) {
      window.location.href = url
    }

    $q.notify({
      color: 'positive',
      message: 'HTML generado para impresión',
      position: 'top',
      icon: 'print'
    })
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Error al generar HTML: ' + error.message,
      position: 'top'
    })
  }
}

const validateBalance = async () => {
  try {
    await fetchTransactions()
    const result = validateBalanceComposable()
    validationResult.value = result

    if (result.balanced && result.errors.length === 0) {
      $q.notify({
        color: 'positive',
        message: 'Balance validado correctamente',
        position: 'top',
        icon: 'check_circle',
      })
    } else {
      $q.notify({
        color: 'negative',
        message: 'Se encontraron errores en el balance',
        position: 'top',
        icon: 'error',
      })
    }
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: 'Error al validar: ' + error.message,
      position: 'top',
    })
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

onMounted(async () => {
  startMonitoring()
  cargarDetalles()
  await fetchTransactions()
})

onUnmounted(() => {
  stopMonitoring()
})
</script>
