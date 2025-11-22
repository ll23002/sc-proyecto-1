import { ref, computed } from 'vue'
import api from '../services/api'

const transactions = ref([])
const loading = ref(false)
const error = ref(null)

export function useTransactions() {
  const fetchTransactions = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.getTransacciones()
      transactions.value = response.data
      return response.data
    } catch (err) {
      console.error('Error fetching transactions:', err)

      // Determinar el tipo de error
      if (err.code === 'ERR_NETWORK') {
        error.value = 'No se puede conectar al servidor. Verifica que el backend esté corriendo.'
      } else if (err.response?.status === 500) {
        error.value = 'El servidor está iniciándose (generando embeddings). Por favor espera un momento e intenta nuevamente.'
      } else if (err.response?.status === 404) {
        error.value = 'Endpoint no encontrado. Verifica la configuración de la API.'
      } else {
        error.value = err.message || 'Error desconocido al cargar transacciones'
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  const loadTransactions = (data) => {
    transactions.value = data
  }

  const addTransaction = async (transaction) => {
    loading.value = true
    error.value = null
    try {
      const response = await api.createTransaccion(transaction)
      transactions.value.push(response.data)
      return response.data
    } catch (err) {
      console.error('Error adding transaction:', err)

      // Manejar errores específicos del backend
      if (err.response?.data?.error) {
        error.value = err.response.data.error
      } else {
        error.value = err.message || 'Error al agregar transacción'
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Crea un asiento contable (nueva estructura)
   * @param {Object} asientoData - Datos del asiento contable
   * @param {string} asientoData.descripcion - Descripción del asiento
   * @param {string} asientoData.fecha - Fecha en formato ISO
   * @param {number} asientoData.numero_asiento - Número del asiento
   * @param {number} asientoData.transaccion - ID de transacción original (opcional)
   * @param {string} asientoData.referencia - Referencia (opcional)
   * @param {Array} asientoData.detalles - Detalles del asiento
   */
  const addAsientoContable = async (asientoData) => {
    loading.value = true
    error.value = null

    try {
      // Validar estructura
      const validationError = validateAsientoData(asientoData)
      if (validationError) {
        error.value = validationError
        throw new Error(validationError)
      }

      const response = await api.createAsientoContable(asientoData)

      // Opcional: recargar transacciones después de crear asiento
      // await fetchTransactions()

      return response.data
    } catch (err) {
      console.error('Error creating asiento:', err)

      if (err.response?.data?.error) {
        error.value = err.response.data.error
      } else if (err.message) {
        error.value = err.message
      } else {
        error.value = 'Error al crear asiento contable'
      }

      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Valida la estructura de un asiento contable antes de enviarlo
   */
  const validateAsientoData = (data) => {
    if (!data.numero_asiento) {
      return 'El número de asiento es requerido'
    }

    if (!data.fecha) {
      return 'La fecha es requerida'
    }

    if (!data.detalles || !Array.isArray(data.detalles) || data.detalles.length === 0) {
      return 'Debe incluir al menos un detalle'
    }

    let totalDebe = 0
    let totalHaber = 0

    for (let i = 0; i < data.detalles.length; i++) {
      const detalle = data.detalles[i]

      if (!detalle.cuenta_id) {
        return `Detalle ${i + 1}: La cuenta es requerida`
      }

      const debe = parseFloat(detalle.debe || 0)
      const haber = parseFloat(detalle.haber || 0)

      if (debe === 0 && haber === 0) {
        return `Detalle ${i + 1}: Debe tener valor en Debe o Haber`
      }

      if (debe > 0 && haber > 0) {
        return `Detalle ${i + 1}: No puede tener valor en ambos, Debe y Haber`
      }

      totalDebe += debe
      totalHaber += haber
    }

    // Validar balance
    if (Math.abs(totalDebe - totalHaber) > 0.01) {
      return `El asiento no está balanceado. Debe: ${totalDebe.toFixed(2)}, Haber: ${totalHaber.toFixed(2)}`
    }

    return null
  }

  /**
   * Calcula el balance de un conjunto de detalles
   */
  const calculateBalance = (detalles) => {
    let totalDebe = 0
    let totalHaber = 0

    detalles.forEach((detalle) => {
      totalDebe += parseFloat(detalle.debe || 0)
      totalHaber += parseFloat(detalle.haber || 0)
    })

    return {
      totalDebe,
      totalHaber,
      balanced: Math.abs(totalDebe - totalHaber) < 0.01,
      difference: totalDebe - totalHaber,
    }
  }

  const updateTransaction = async (id, updatedTransaction) => {
    loading.value = true
    try {
      const response = await api.updateTransaccion(id, updatedTransaction)
      const index = transactions.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        transactions.value[index] = response.data
      }
      return response.data
    } catch (error) {
      console.error('Error updating transaction:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteTransaction = async (id) => {
    loading.value = true
    try {
      await api.deleteTransaccion(id)
      transactions.value = transactions.value.filter((t) => t.id !== id)
    } catch (error) {
      console.error('Error deleting transaction:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const filterByPeriod = (period, year, month = null, quarter = null) => {
    return transactions.value.filter((t) => {
      const date = new Date(t.fecha)
      const transactionYear = date.getFullYear()

      if (period === 'anual') {
        return transactionYear === parseInt(year)
      } else if (period === 'mensual' && month) {
        return transactionYear === parseInt(year) && date.getMonth() + 1 === parseInt(month)
      } else if (period === 'trimestral' && quarter) {
        const transactionQuarter = Math.ceil((date.getMonth() + 1) / 3)
        return transactionYear === parseInt(year) && transactionQuarter === parseInt(quarter)
      }
      return true
    })
  }

  const validateBalance = () => {
    let debe = 0
    let haber = 0
    const errors = []

    transactions.value.forEach((t, index) => {
      const transactionDebe = parseFloat(t.debe || 0)
      const transactionHaber = parseFloat(t.haber || 0)

      if (transactionDebe === 0 && transactionHaber === 0) {
        errors.push(
          `Transacción ${index + 1} (${t.descripcion || 'Sin descripción'}): No tiene valor en Debe ni Haber`,
        )
      }
      if (transactionDebe > 0 && transactionHaber > 0) {
        errors.push(
          `Transacción ${index + 1} (${t.descripcion || 'Sin descripción'}): Tiene valor en ambos, Debe y Haber`,
        )
      }

      debe += transactionDebe
      haber += transactionHaber
    })

    const balanced = Math.abs(debe - haber) < 0.01

    return {
      balanced,
      debe,
      haber,
      difference: debe - haber,
      errors,
    }
  }

  const allTransactions = computed(() => transactions.value)
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value)
  const hasTransactions = computed(() => transactions.value.length > 0)

  return {
    transactions: allTransactions,
    loading: isLoading,
    error: hasError,
    hasTransactions,
    fetchTransactions,
    loadTransactions,
    addTransaction,
    addAsientoContable,
    updateTransaction,
    deleteTransaction,
    filterByPeriod,
    validateBalance,
    validateAsientoData,
    calculateBalance,
  }
}
