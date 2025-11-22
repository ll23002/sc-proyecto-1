<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md page-title">Cargar Datos desde Excel</div>

    <!-- Banner de estado del backend -->
    <BackendStatusBanner
      :backend-status="backendStatus"
      :error="error"
      @check="checkBackendStatus"
    />

    <q-card class="themed-card">
      <q-card-section>
        <p class="themed-text">
          Suba un archivo Excel (.xlsx, .xls) con la siguiente estructura: Fecha (YYYY-MM-DD),
          Descripción, Monto, Moneda
        </p>
        <q-file
          v-model="file"
          label="Seleccione un archivo Excel"
          accept=".xlsx, .xls"
          outlined
          dark
          @update:model-value="onFileSelected"
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
        </q-file>
        <q-btn
          class="q-mt-md"
          color="primary"
          label="Procesar Archivo"
          :disable="!file"
          :loading="processing"
          @click="processFile"
        />
      </q-card-section>
    </q-card>
    <q-card v-if="previewData.length > 0" class="q-mt-md themed-card">
      <q-card-section>
        <div class="text-h6 themed-title">Vista Previa de Datos</div>
        <p class="text-caption themed-text">{{ previewData.length }} transacciones detectadas</p>
        <q-table
          :rows="previewData"
          :columns="columns"
          row-key="id"
          flat
          dark
          class="themed-table"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template v-slot:body-cell-monto="props">
            <q-td :props="props">{{ formatCurrency(props.row.Monto, props.row.Moneda) }}</q-td>
          </template>
        </q-table>
        <div class="q-mt-md">
          <q-banner v-if="validationErrors.length > 0" class="bg-negative text-white q-mb-md">
            <template v-slot:avatar>
              <q-icon name="warning" />
            </template>
            <div class="text-subtitle2">Se encontraron errores de validación:</div>
            <ul class="q-pl-md q-mb-none">
              <li v-for="(error, idx) in validationErrors" :key="idx">{{ error }}</li>
            </ul>
          </q-banner>
          <q-btn
            color="positive"
            label="Enviar al Backend"
            icon="cloud_upload"
            :loading="uploading"
            :disable="validationErrors.length > 0"
            @click="sendToBackend"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useBackendStatus } from 'src/composables/useBackendStatus'
import BackendStatusBanner from 'src/components/BackendStatusBanner.vue'
import * as XLSX from 'xlsx'
import axios from 'axios'

const $q = useQuasar()
const router = useRouter()
const { backendStatus, error, checkBackendStatus, startMonitoring, stopMonitoring } =
  useBackendStatus()
const file = ref(null)
const previewData = ref([])
const validationErrors = ref([])
const processing = ref(false)
const uploading = ref(false)
const columns = [
  { name: 'fecha', label: 'Fecha', field: 'Fecha', align: 'left', sortable: true },
  {
    name: 'descripcion',
    label: 'Descripción',
    field: 'Descripción',
    align: 'left',
    sortable: true,
  },
  { name: 'monto', label: 'Monto', field: 'Monto', align: 'right', sortable: true },
  { name: 'moneda', label: 'Moneda', field: 'Moneda', align: 'center', sortable: true },
]
const onFileSelected = (selectedFile) => {
  if (selectedFile) {
    $q.notify({
      color: 'info',
      message: `Archivo seleccionado: ${selectedFile.name}`,
      position: 'top',
    })
    previewData.value = []
    validationErrors.value = []
  }
}
const formatDate = (dateStr) => {
  if (!dateStr) return 'Fecha inválida'
  try {
    if (typeof dateStr === 'number') {
      const date = new Date((dateStr - 25569) * 86400 * 1000)
      return date.toISOString().split('T')[0]
    }
    return dateStr
  } catch {
    return dateStr
  }
}
const validateData = (data) => {
  const errors = []
  const allowedCurrencies = ['USD', 'EUR', 'GBP']
  data.forEach((row, index) => {
    const rowNum = index + 2
    if (!row.Fecha) errors.push(`Fila ${rowNum}: La columna 'Fecha' es obligatoria`)
    if (!row.Descripción) errors.push(`Fila ${rowNum}: La columna 'Descripción' es obligatoria`)
    if (row.Monto === undefined || row.Monto === null)
      errors.push(`Fila ${rowNum}: La columna 'Monto' es obligatoria`)
    if (!row.Moneda) errors.push(`Fila ${rowNum}: La columna 'Moneda' es obligatoria`)
    if (typeof row.Fecha === 'number') row.Fecha = formatDate(row.Fecha)
    if (row.Monto !== undefined && row.Monto !== null && parseFloat(row.Monto) <= 0)
      errors.push(`Fila ${rowNum}: El monto debe ser positivo`)
    if (row.Moneda && !allowedCurrencies.includes(row.Moneda.toUpperCase()))
      errors.push(`Fila ${rowNum}: Moneda no permitida. Use: ${allowedCurrencies.join(', ')}`)
  })
  return errors
}
const processFile = () => {
  if (!file.value) {
    $q.notify({ color: 'negative', message: 'Por favor seleccione un archivo', position: 'top' })
    return
  }
  processing.value = true
  validationErrors.value = []
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(firstSheet)
      const errors = validateData(jsonData)
      validationErrors.value = errors
      previewData.value = jsonData
      if (errors.length === 0) {
        $q.notify({
          color: 'positive',
          message: `Archivo procesado correctamente. ${jsonData.length} transacciones encontradas.`,
          position: 'top',
        })
      } else {
        $q.notify({
          color: 'warning',
          message: `Se encontraron ${errors.length} errores de validación`,
          position: 'top',
        })
      }
    } catch (error) {
      $q.notify({
        color: 'negative',
        message: 'Error al procesar el archivo: ' + error.message,
        position: 'top',
      })
    } finally {
      processing.value = false
    }
  }
  reader.onerror = () => {
    $q.notify({ color: 'negative', message: 'Error al leer el archivo', position: 'top' })
    processing.value = false
  }
  reader.readAsArrayBuffer(file.value)
}
const formatCurrency = (amount, currency) => {
  return new Intl.NumberFormat('es-SV', { style: 'currency', currency: currency || 'USD' }).format(
    amount,
  )
}
const sendToBackend = async () => {
  if (!file.value) {
    $q.notify({ color: 'negative', message: 'Por favor seleccione un archivo', position: 'top' })
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file.value)

    const response = await axios.post('http://localhost:8000/api/cargar-excel/', formData)

    $q.notify({
      color: 'positive',
      message: `Archivo enviado correctamente: ${response.data.message || 'Operación exitosa'}`,
      position: 'top',
      timeout: 2500,
    })

    // Limpiar los datos después de cargar exitosamente
    file.value = null
    previewData.value = []
    validationErrors.value = []

    // Redirigir a la página inicial después de 2 segundos
    setTimeout(() => {
      router.push('/')
    }, 2000)

  } catch (error) {
    $q.notify({
      color: 'negative',
      message: `Error al enviar el archivo: ${error.response?.data?.message || error.message}`,
      position: 'top',
    })
  } finally {
    uploading.value = false
  }
}

onMounted(() => {
  startMonitoring()
})

onUnmounted(() => {
  stopMonitoring()
})
</script>
<style scoped lang="scss">
.page-title {
  color: rgba(255, 255, 255, 0.87);
}

.themed-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.themed-text {
  color: rgba(255, 255, 255, 0.7);
}

.themed-title {
  color: rgba(255, 255, 255, 0.87);
}

.themed-table {
  background: transparent;
}

.themed-table :deep(thead tr th) {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.87);
}

.themed-table :deep(tbody tr td) {
  color: rgba(255, 255, 255, 0.7);
}

body.body--light .page-title {
  color: rgba(0, 0, 0, 0.87);
}

body.body--light .themed-card {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

body.body--light .themed-text {
  color: rgba(0, 0, 0, 0.6);
}

body.body--light .themed-title {
  color: rgba(0, 0, 0, 0.87);
}

body.body--light .themed-table :deep(thead tr th) {
  background: #f5f5f5;
  color: rgba(0, 0, 0, 0.87);
}

body.body--light .themed-table :deep(tbody tr td) {
  color: rgba(0, 0, 0, 0.87);
}
</style>
