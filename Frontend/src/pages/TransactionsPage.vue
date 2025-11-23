<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md page-title">Gestión de Transacciones</div>

    <q-card class="themed-card q-mb-lg">
      <q-card-section>
        <div class="row justify-between items-center q-mb-md">
          <div class="text-h6 themed-title">Transacciones Pendientes por Clasificar</div>
          <q-btn
            color="primary"
            label="Refrescar"
            icon="refresh"
            :loading="loading"
            @click="cargarDatos"
          />
        </div>

        <div class="row q-gutter-sm q-mb-md items-center">
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

        <div class="row q-mb-md">
          <div class="col-12">
            <q-card flat class="bg-grey-9 q-pa-sm" style="border-radius: 8px">
              <div class="row items-center q-col-gutter-sm">
                <div class="col-12 col-md-3">
                  <q-input v-model="manual.fecha" label="Fecha" type="date" dense outlined dark />
                </div>
                <div class="col-12 col-md-4">
                  <q-input v-model="manual.descripcion" label="Descripción" dense outlined dark />
                </div>
                <div class="col-6 col-md-2">
                  <q-input
                    v-model.number="manual.monto"
                    label="Monto"
                    type="number"
                    dense
                    outlined
                    dark
                  />
                </div>
                <div class="col-6 col-md-1">
                  <q-select
                    v-model="manual.moneda"
                    :options="monedaOptions"
                    label="Moneda"
                    dense
                    outlined
                    dark
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-12 col-md-2 text-right">
                  <q-btn
                    color="positive"
                    label="Agregar Manual"
                    @click="crearManual"
                    :loading="creatingManual"
                  />
                </div>
              </div>
            </q-card>
          </div>
        </div>

        <q-table
          :rows="transaccionesFiltradas"
          :columns="columns"
          row-key="id"
          flat
          dark
          class="themed-table"
          :pagination="{ rowsPerPage: 10 }"
          :loading="loading"
        >
          <template v-slot:body-cell-monto="props">
            <q-td :props="props" class="text-weight-bold text-primary">
              {{ formatCurrency(props.row.monto) }} {{ props.row.moneda }}
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                color="positive"
                label="Contabilizar"
                icon="account_balance_wallet"
                size="sm"
                @click="abrirDialogoContabilizar(props.row)"
              >
                <q-tooltip>Crear Asiento para esta transacción</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                size="sm"
                class="q-ml-sm"
                @click="confirmDelete(props.row.id)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-card class="themed-card">
      <q-card-section>
        <div class="row justify-between items-center q-mb-md">
          <div class="text-h6 themed-title">Transacciones Clasificadas</div>
          <q-btn
            color="primary"
            label="Cargar Clasificadas"
            icon="download"
            :loading="loadingClasificadas"
            @click="cargarTransaccionesClasificadas"
          />
        </div>

        <q-table
          :rows="transaccionesClasificadas"
          :columns="columnsClasificadas"
          row-key="id"
          flat
          dark
          class="themed-table"
          v-model:pagination="paginationClasificadas"
          :loading="loadingClasificadas"
        >
          <template v-slot:body-cell-debe="props">
            <q-td :props="props" class="text-right text-positive">
              {{ props.row.debe > 0 ? formatCurrency(props.row.debe) : '-' }}
            </q-td>
          </template>

          <template v-slot:body-cell-haber="props">
            <q-td :props="props" class="text-right text-negative">
              {{ props.row.haber > 0 ? formatCurrency(props.row.haber) : '-' }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog
      v-model="showDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="dialog-card bg-grey-10 text-white">
        <q-toolbar class="bg-primary text-white">
          <q-btn flat round dense icon="close" v-close-popup />
          <q-toolbar-title>Contabilizar Transacción</q-toolbar-title>

        </q-toolbar>

        <q-card-section class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-card flat bordered class="bg-grey-9 q-pa-md">
              <div class="text-subtitle2 text-grey-5">Transacción Original</div>
              <div class="text-h5 q-mt-sm">{{ transaccionSeleccionada?.descripcion }}</div>
              <div class="text-h4 text-primary q-mt-md">
                {{ formatCurrency(transaccionSeleccionada?.monto) }}
              </div>
              <div class="q-mt-md">
                <q-chip color="grey-8" text-color="white" icon="event">
                  {{ transaccionSeleccionada?.fecha }}
                </q-chip>
                <q-chip color="grey-8" text-color="white" icon="fingerprint">
                  ID: {{ transaccionSeleccionada?.id }}
                </q-chip>
              </div>

              <q-separator class="q-my-lg" />

              <div class="text-subtitle2 text-grey-5 q-mb-sm">Sugerencia IA</div>
              <div class="bg-grey-10 q-pa-sm rounded-borders text-caption text-italic">
                "{{
                  transaccionSeleccionada?.clasificacion?.justificacion ||
                  'Sin sugerencia de IA disponible.'
                }}"
              </div>
            </q-card>
          </div>

          <div class="col-12 col-md-8">
            <div class="text-h6 q-mb-md">Detalles del Asiento</div>

            <div class="row q-col-gutter-sm q-mb-md bg-grey-9 q-pa-sm rounded-borders">
              <div class="col-12 col-sm-4">
                <q-select
                  v-model="nuevaLinea.cuenta_id"
                  :options="cuentasFiltradas"
                  label="Cuenta Contable"
                  dense
                  outlined
                  dark
                  options-dense
                  emit-value
                  map-options
                  use-input
                  input-debounce="300"
                  @filter="filtrarCuentas"
                  @input-value="inputCuenta = $event"
                  hide-selected
                  fill-input
                  clearable
                  clear-icon="close"
                  hint="Escribe para buscar por código o nombre"
                >
                  <template v-slot:prepend>
                    <q-icon name="search" />
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        <div class="text-center q-py-md">
                          <q-icon name="search_off" size="2em" class="q-mb-sm" />
                          <div>No se encontraron cuentas</div>
                          <div class="text-caption">Prueba con otro término de búsqueda</div>
                        </div>
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:after-options v-if="cuentasFiltradas.length > 0">
                    <q-separator />
                    <q-item dense class="text-grey-6 text-caption">
                      <q-item-section>
                        {{ cuentasFiltradas.length }} cuenta(s) encontrada(s)
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-12 col-sm-4">
                <q-input v-model="nuevaLinea.descripcion" label="Descripción" dense outlined dark />
              </div>
              <div class="col-6 col-sm-2">
                <q-input
                  v-model.number="nuevaLinea.debe"
                  label="Debe"
                  type="number"
                  dense
                  outlined
                  dark
                  @update:model-value="
                    (val) => {
                      if (val > 0) nuevaLinea.haber = 0
                    }
                  "
                />
              </div>
              <div class="col-6 col-sm-2">
                <q-input
                  v-model.number="nuevaLinea.haber"
                  label="Haber"
                  type="number"
                  dense
                  outlined
                  dark
                  @update:model-value="
                    (val) => {
                      if (val > 0) nuevaLinea.debe = 0
                    }
                  "
                />
              </div>
              <div class="col-12 text-right">
                <q-btn
                  color="secondary"
                  label="Agregar Línea"
                  size="sm"
                  icon="add"
                  @click="agregarLinea"
                />
              </div>
            </div>

            <q-markup-table flat dark class="bg-transparent">
              <thead>
                <tr>
                  <th class="text-left">Cuenta</th>
                  <th class="text-left">Descripción</th>
                  <th class="text-right">Debe</th>
                  <th class="text-right">Haber</th>
                  <th class="text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(linea, index) in asientoDetalles"
                  :key="index"
                  class="editable-row"
                  @click="editarLinea(index)"
                  style="cursor: pointer;"
                  :class="{ 'row-sin-cuenta': !linea.cuenta_id }"
                >
                  <td>
                    <span v-if="linea.cuenta_id">{{ getCuentaLabel(linea.cuenta_id) }}</span>
                    <span v-else class="text-warning text-weight-bold">
                      <q-icon name="warning" size="xs" /> Sin cuenta asignada
                    </span>
                  </td>
                  <td>{{ linea.descripcion }}</td>
                  <td class="text-right text-positive">
                    {{ linea.debe > 0 ? formatCurrency(linea.debe) : '-' }}
                  </td>
                  <td class="text-right text-negative">
                    {{ linea.haber > 0 ? formatCurrency(linea.haber) : '-' }}
                  </td>
                  <td class="text-center" @click.stop>
                    <q-btn
                      flat
                      round
                      icon="delete"
                      color="red"
                      size="sm"
                      @click="asientoDetalles.splice(index, 1)"
                    />
                  </td>
                </tr>
                <tr class="bg-grey-9 text-weight-bold">
                  <td colspan="2" class="text-right">TOTALES:</td>
                  <td class="text-right" :class="balanceClass">{{ formatCurrency(totalDebe) }}</td>
                  <td class="text-right" :class="balanceClass">{{ formatCurrency(totalHaber) }}</td>
                  <td></td>
                </tr>
              </tbody>
            </q-markup-table>

            <q-banner
              v-if="!esBalanceado"
              dense
              class="bg-warning text-black q-mt-md rounded-borders"
            >
              <template v-slot:avatar>
                <q-icon name="warning" />
              </template>
              El asiento no cuadra. Diferencia:
              {{ formatCurrency(Math.abs(totalDebe - totalHaber)) }}
            </q-banner>

          </div>

        </q-card-section>
          <div class="row justify-end">
            <q-btn
              flat
              label="Guardar Asiento"
              icon="save"
              color="primary"
              @click="guardarAsiento"
              :loading="saving"
            />
          </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from 'src/services/api'

const $q = useQuasar()

const loading = ref(false)
const saving = ref(false)
const transacciones = ref([])
const cuentas = ref([])

// Variables para transacciones clasificadas
const loadingClasificadas = ref(false)
const transaccionesClasificadas = ref([])
const paginationClasificadas = ref({
  sortBy: 'fecha',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsPerPageOptions: [5, 10, 20, 50, 100],
})

const showDialog = ref(false)
const transaccionSeleccionada = ref(null)
const asientoDetalles = ref([])
const nuevaLinea = ref({ cuenta_id: null, descripcion: '', debe: 0, haber: 0 })

// Variables para el autocompletado de cuentas
const inputCuenta = ref('')
const cuentasFiltradas = ref([])

const columns = [
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'descripcion', label: 'Descripción Original', field: 'descripcion', align: 'left' },
  { name: 'monto', label: 'Monto', field: 'monto', align: 'right' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' },
]

// Columnas para transacciones clasificadas
const columnsClasificadas = [
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'codigo_cuenta', label: 'Código', field: 'codigo_cuenta', align: 'left', sortable: true },
  { name: 'cuenta', label: 'Cuenta Contable', field: 'cuenta', align: 'left', sortable: true },
  { name: 'descripcion', label: 'Descripción', field: 'descripcion', align: 'left' },
  { name: 'debe', label: 'Debe', field: 'debe', align: 'right', sortable: true },
  { name: 'haber', label: 'Haber', field: 'haber', align: 'right', sortable: true },
]

const cuentasOptions = computed(() =>
  cuentas.value.map((c) => ({
    label: `${c.codigo_cuenta} - ${c.nombre_cuenta}`,
    value: c.id,
  })),
)

// Función para filtrar cuentas en el autocompletado
const filtrarCuentas = (val, update) => {
  if (val === '') {
    update(() => {
      cuentasFiltradas.value = cuentasOptions.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    cuentasFiltradas.value = cuentasOptions.value.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1
    )
  })
}

// Monedas para el formulario manual
const monedaOptions = [
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'Local', value: 'USD' },
]

const manual = ref({
  fecha: new Date().toISOString().slice(0, 10),
  descripcion: '',
  monto: 0,
  moneda: 'USD',
})
const creatingManual = ref(false)

const crearManual = async () => {
  if (!manual.value.fecha || !manual.value.descripcion || !manual.value.monto) {
    return $q.notify({ type: 'warning', message: 'Completa fecha, descripción y monto' })
  }

  creatingManual.value = true
  try {
    const payload = {
      fecha: manual.value.fecha,
      descripcion: manual.value.descripcion,
      monto: manual.value.monto,
      moneda: manual.value.moneda,
    }

    const res = await api.createTransaccion(payload)
    // agregar al listado local para que aparezca en la tabla
    transacciones.value.unshift(res.data)
    $q.notify({ type: 'positive', message: 'Transacción creada' })
    // reset form
    manual.value = {
      fecha: new Date().toISOString().slice(0, 10),
      descripcion: '',
      monto: 0,
      moneda: 'USD',
    }
  } catch (e) {
    console.error('Error creando transacción manual:', e)
    $q.notify({ type: 'negative', message: e.response?.data?.error || 'Error creando transacción' })
  } finally {
    creatingManual.value = false
  }
}

const periodOptions = [
  { label: 'Todos', value: '' },
  { label: 'Mensual', value: 'mensual' },
  { label: 'Trimestral', value: 'trimestral' },
  { label: 'Anual', value: 'anual' },
]

const monthOptions = [
  { label: 'Enero', value: 1 },
  { label: 'Febrero', value: 2 },
  { label: 'Marzo', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Mayo', value: 5 },
  { label: 'Junio', value: 6 },
  { label: 'Julio', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Septiembre', value: 9 },
  { label: 'Octubre', value: 10 },
  { label: 'Noviembre', value: 11 },
  { label: 'Diciembre', value: 12 },
]

const quarterOptions = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
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
    quarter: selectedQuarter.value || null,
  }
}

const clearFilter = () => {
  selectedPeriod.value = ''
  selectedYear.value = new Date().getFullYear()
  selectedMonth.value = null
  selectedQuarter.value = null
  appliedFilter.value = { period: '', year: null, month: null, quarter: null }
}

const transaccionesFiltradas = computed(() => {
  const { period, year, month, quarter } = appliedFilter.value

  if (!period) return transacciones.value

  return transacciones.value.filter((t) => {
    if (!t.fecha) return false
    const date = new Date(t.fecha)
    if (Number.isNaN(date.getTime())) return false

    const transactionYear = date.getFullYear()

    if (period === 'anual') {
      if (!year) return true
      return transactionYear === parseInt(year)
    }

    if (period === 'mensual') {
      if (!year || !month) return false
      return transactionYear === parseInt(year) && date.getMonth() + 1 === parseInt(month)
    }

    if (period === 'trimestral') {
      if (!year || !quarter) return false
      const transactionQuarter = Math.ceil((date.getMonth() + 1) / 3)
      return transactionYear === parseInt(year) && transactionQuarter === parseInt(quarter)
    }

    return true
  })
})

const totalDebe = computed(() =>
  asientoDetalles.value.reduce((sum, item) => sum + Number(item.debe || 0), 0),
)
const totalHaber = computed(() =>
  asientoDetalles.value.reduce((sum, item) => sum + Number(item.haber || 0), 0),
)
const esBalanceado = computed(
  () => Math.abs(totalDebe.value - totalHaber.value) < 0.01 && asientoDetalles.value.length > 0,
)
const balanceClass = computed(() => (esBalanceado.value ? 'text-positive' : 'text-warning'))

const formatCurrency = (val) =>
  new Intl.NumberFormat('es-SV', { style: 'currency', currency: 'USD' }).format(val)

const getCuentaLabel = (id) => {
  const c = cuentas.value.find((x) => x.id === id)
  return c ? c.nombre_cuenta : 'ID: ' + id
}

const cargarDatos = async () => {
  loading.value = true
  try {
    const [txRes, ctaRes] = await Promise.all([api.getTransacciones(), api.getCuentas()])
    // Filtrar solo transacciones NO procesadas
    transacciones.value = txRes.data.filter(t => !t.procesada)
    cuentas.value = ctaRes.data
    // Inicializar cuentas filtradas con todas las opciones
    cuentasFiltradas.value = cuentasOptions.value

    // Si ya había transacciones clasificadas cargadas, recargarlas automáticamente
    if (transaccionesClasificadas.value.length > 0) {
      await cargarTransaccionesClasificadas()
    }
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error cargando datos' })
    console.error(e)
  } finally {
    loading.value = false
  }
}

const cargarTransaccionesClasificadas = async () => {
  loadingClasificadas.value = true
  try {
    // Asegurarse de que las cuentas estén cargadas primero
    if (cuentas.value.length === 0) {
      const ctaRes = await api.getCuentas()
      cuentas.value = ctaRes.data
      // Inicializar cuentas filtradas
      cuentasFiltradas.value = cuentasOptions.value
    }

    const response = await api.getAsientosContables()

    // Transformar los asientos en un array plano de detalles
    const detalles = []

    response.data.forEach((asiento) => {
      if (asiento.detalles && Array.isArray(asiento.detalles)) {
        asiento.detalles.forEach((detalle) => {
          // Buscar la cuenta correspondiente para obtener código y nombre
          // Intentar con diferentes posibles nombres de campo
          const cuentaId = detalle.cuenta_id || detalle.cuenta || detalle.cuentaId
          const cuenta = cuentas.value.find((c) => c.id === cuentaId)

          // Log para debugging (puedes quitar esto después)
          if (!cuenta) {
            console.warn('Cuenta no encontrada para ID:', cuentaId, 'Detalle:', detalle)
          }

          detalles.push({
            id: `${asiento.id}-${detalle.id || Math.random()}`,
            fecha: asiento.fecha,
            codigo_cuenta: cuenta?.codigo_cuenta || 'N/A',
            cuenta: cuenta?.nombre_cuenta || `ID: ${cuentaId || 'undefined'}`,
            descripcion: detalle.descripcion || asiento.numero_asiento || '',
            debe: parseFloat(detalle.debe || 0),
            haber: parseFloat(detalle.haber || 0),
          })
        })
      }
    })

    transaccionesClasificadas.value = detalles

    $q.notify({
      type: 'positive',
      message: `${detalles.length} registros cargados`,
      position: 'top',
    })
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: 'Error cargando transacciones clasificadas',
      caption: e.response?.data?.error || e.message,
    })
    console.error('Error completo:', e)
  } finally {
    loadingClasificadas.value = false
  }
}

const abrirDialogoContabilizar = (tx) => {
  transaccionSeleccionada.value = tx
  showDialog.value = true

  const monto = parseFloat(tx.monto)

  const cuentaBancoId =
    cuentas.value.find((c) => c.nombre_cuenta.toLowerCase().includes('banco'))?.id || null

  const sugerencia = tx.clasificacion || null

  let cuentaSugeridaId = null
  let esEgreso = true

  if (sugerencia) {
    cuentaSugeridaId = sugerencia.cuenta_sugerida

    const tipo = (sugerencia.tipo_transaccion || '').toUpperCase()
    esEgreso = tipo === 'EGRESO' || tipo === 'GASTO'

    if (sugerencia.justificacion) {
      $q.notify({
        type: 'info',
        message: 'Sugerencia IA',
        caption: sugerencia.justificacion,
        timeout: 3000,
      })
    }
  }

  // Si no hay cuenta sugerida válida, notificar al usuario
  if (!cuentaSugeridaId) {
    $q.notify({
      type: 'warning',
      message: 'No se encontró una cuenta contable correspondiente para este asiento',
      caption: 'Por favor asigna manualmente las cuentas haciendo clic en la fila',
      timeout: 5000,
      position: 'top',
      icon: 'warning',
    })
  }

  if (esEgreso) {
    asientoDetalles.value = [
      {
        cuenta_id: cuentaSugeridaId,
        descripcion: tx.descripcion,
        debe: monto,
        haber: 0,
      },
      {
        cuenta_id: cuentaBancoId,
        descripcion: 'Salida de Banco',
        debe: 0,
        haber: monto,
      },
    ]
  } else {
    asientoDetalles.value = [
      {
        cuenta_id: cuentaBancoId,
        descripcion: 'Ingreso a Banco',
        debe: monto,
        haber: 0,
      },
      {
        cuenta_id: cuentaSugeridaId,
        descripcion: tx.descripcion,
        debe: 0,
        haber: monto,
      },
    ]
  }
}

const editarLinea = (index) => {
  const linea = asientoDetalles.value[index]

  // Pre-llenar el formulario de nueva línea con los datos existentes
  nuevaLinea.value = {
    cuenta_id: linea.cuenta_id,
    descripcion: linea.descripcion,
    debe: linea.debe,
    haber: linea.haber,
  }

  // Eliminar la línea que se está editando
  asientoDetalles.value.splice(index, 1)

  // Notificar al usuario
  $q.notify({
    type: 'info',
    message: 'Editando asiento',
    caption: 'Modifica los valores y presiona "Agregar Línea" para guardar',
    timeout: 2000,
    position: 'top',
  })
}

const agregarLinea = () => {
  if (!nuevaLinea.value.cuenta_id) return $q.notify('Selecciona una cuenta')
  asientoDetalles.value.push({ ...nuevaLinea.value })
  nuevaLinea.value = { cuenta_id: null, descripcion: '', debe: 0, haber: 0 }
}

const guardarAsiento = async () => {
  if (!esBalanceado.value) return $q.notify({ type: 'warning', message: 'El asiento no cuadra' })

  saving.value = true
  try {
    const payload = {
      numero_asiento: `AS-${Date.now()}`,
      transaccion: transaccionSeleccionada.value.id,
      fecha: transaccionSeleccionada.value.fecha,
      detalles: asientoDetalles.value,
    }

    await api.createAsientoContable(payload)

    $q.notify({ type: 'positive', message: '¡Contabilizado con éxito!' })
    showDialog.value = false
    transacciones.value = transacciones.value.filter(
      (t) => t.id !== transaccionSeleccionada.value.id,
    )

    // Recargar automáticamente las transacciones clasificadas
    await cargarTransaccionesClasificadas()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.error || 'Error al guardar' })
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (id) => {
  if (!confirm('¿Eliminar transacción?')) return
  try {
    await api.deleteTransaccion(id)
    transacciones.value = transacciones.value.filter((t) => t.id !== id)
    $q.notify({ type: 'positive', message: 'Eliminada' })
  } catch (e) {
    $q.notify({ type: 'negative', message: `Error borrando ${e}` })
  }
}

onMounted(cargarDatos)
</script>

<style scoped>
.themed-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.themed-table {
  background: transparent;
}

.page-title {
  color: white;
}

.btn-apply {
  background-color: #0b5fff !important;
  color: #ffffff !important;
  border-color: transparent !important;
}

.btn-apply:hover {
  background-color: #094edd !important;
}

.editable-row:hover {
  background-color: rgba(255, 255, 255, 0.05) !important;
  transition: background-color 0.2s ease;
}

.row-sin-cuenta {
  background-color: rgba(255, 152, 0, 0.1) !important;
}

.row-sin-cuenta:hover {
  background-color: rgba(255, 152, 0, 0.2) !important;
}
</style>
