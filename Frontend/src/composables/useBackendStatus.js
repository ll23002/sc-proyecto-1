import { ref } from 'vue'
import api from '../services/api'
import { useQuasar } from 'quasar'

let statusCheckInterval = null
const backendStatus = ref('checking') // checking, initializing, ready, error
const error = ref(null)
const hasNotified = ref(false)

export function useBackendStatus() {
  const $q = useQuasar()

  const checkBackendStatus = async () => {
    try {
      backendStatus.value = 'checking'
      error.value = null

      // Hacer un ping simple al backend (usando el endpoint de cuentas que debería ser ligero)
      await api.getCuentas()

      backendStatus.value = 'ready'

      // Si está listo, detener el chequeo periódico
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval)
        statusCheckInterval = null
      }

      // Mostrar notificación solo una vez
      if (!hasNotified.value) {
        hasNotified.value = true
        $q.notify({
          type: 'positive',
          message: '✅ Sistema listo',
          caption: 'Puedes usar la aplicación ahora',
          position: 'top',
          timeout: 2000,
        })
      }
    } catch (err) {
      if (err.response?.status === 500) {
        backendStatus.value = 'initializing'
        error.value = 'El servidor está iniciándose...'
      } else if (err.code === 'ERR_NETWORK') {
        backendStatus.value = 'error'
        error.value = 'No se puede conectar al servidor'
      } else {
        backendStatus.value = 'error'
        error.value = err.message || 'Error desconocido'
      }
    }
  }

  const startMonitoring = () => {
    // Hacer un solo check inicial del backend
    // Sin polling automático - solo verificamos una vez al cargar
    checkBackendStatus()
  }

  const stopMonitoring = () => {
    if (statusCheckInterval) {
      clearInterval(statusCheckInterval)
      statusCheckInterval = null
    }
  }

  return {
    backendStatus,
    error,
    checkBackendStatus,
    startMonitoring,
    stopMonitoring,
  }
}
