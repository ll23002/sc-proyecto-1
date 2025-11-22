<template>
  <!-- Banner de estado del servidor - Cargando -->
  <q-banner v-if="backendStatus === 'checking'" class="bg-info text-white q-mb-md" rounded>
    <template v-slot:avatar>
      <q-spinner-hourglass color="white" size="sm" />
    </template>
    <div class="text-subtitle1">Verificando estado del backend...</div>
  </q-banner>

  <!-- Banner de estado del servidor - Iniciando -->
  <q-banner v-if="backendStatus === 'initializing'" class="bg-warning text-white q-mb-md" rounded>
    <template v-slot:avatar>
      <q-spinner-rings color="white" size="sm" />
    </template>
    <div class="text-subtitle1">⚙️ Backend iniciándose</div>
    <div class="text-caption">Generando embeddings de cuentas contables. Por favor espera...</div>
    <template v-slot:action>
      <q-btn flat color="white" label="Verificar de nuevo" @click="$emit('check')" />
    </template>
  </q-banner>

  <!-- Banner de estado del servidor - Listo -->
  <q-banner v-if="backendStatus === 'ready'" class="bg-positive text-white q-mb-md" rounded>
    <template v-slot:avatar>
      <q-icon name="check_circle" color="white" size="md" />
    </template>
    <div class="text-subtitle1">✅ Embeddings listos</div>
    <div class="text-caption">El sistema está listo para operar</div>
  </q-banner>

  <!-- Banner de estado del servidor - Error -->
  <q-banner v-if="backendStatus === 'error'" class="bg-negative text-white q-mb-md" rounded>
    <template v-slot:avatar>
      <q-icon name="error" color="white" />
    </template>
    <div class="text-subtitle1">{{ error || 'Error de conexión' }}</div>
    <div class="text-caption">Verifica que el backend esté corriendo</div>
    <template v-slot:action>
      <q-btn flat color="white" label="Reintentar" @click="$emit('check')" />
    </template>
  </q-banner>
</template>

<script setup>
defineProps({
  backendStatus: {
    type: String,
    required: true,
  },
  error: {
    type: String,
    default: null,
  },
})

defineEmits(['check'])
</script>
