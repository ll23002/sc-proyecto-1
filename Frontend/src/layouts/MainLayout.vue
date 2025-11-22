<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-transparent text-white">
      <q-toolbar>
        <q-toolbar-title class="text-primary text-weight-bold cursor-pointer" @click="goTo('/')">
          <q-icon name="account_balance" size="md" class="q-mr-sm" />
          Sistema Contable
        </q-toolbar-title>

        <q-space />

        <!-- Botones de navegación principales (desktop) -->
        <q-btn flat dense label="Inicio" icon="home" @click="goTo('/')" class="gt-sm q-mr-sm" />

        <q-btn
          unelevated
          color="primary"
          label="Cargar Datos"
          icon="upload_file"
          @click="goTo('/cargar-datos')"
          class="gt-sm q-mr-sm"
        />

        <q-btn flat dense round icon="list_alt" class="q-mr-sm" @click="goTo('/transacciones')">
          <q-tooltip>Transacciones</q-tooltip>
        </q-btn>

        <q-btn flat dense round icon="assessment" class="q-mr-sm" @click="goTo('/reportes')">
          <q-tooltip>Reportes</q-tooltip>
        </q-btn>

        <!-- Botón de configuración -->
        <q-btn flat dense round icon="settings" @click="showSettingsDialog = true">
          <q-tooltip>Configuración</q-tooltip>
        </q-btn>

        <!-- Menú hamburguesa (móvil) -->
        <q-btn flat dense round icon="menu" class="lt-md" @click="toggleLeftDrawer" />
      </q-toolbar>
    </q-header>

    <!-- Drawer para móvil -->
    <q-drawer v-model="leftDrawerOpen" bordered class="lt-md">
      <q-list>
        <q-item-label header class="text-primary text-weight-bold"> Navegación </q-item-label>

        <q-item clickable @click="goTo('/')">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>Inicio</q-item-section>
        </q-item>

        <q-item clickable @click="goTo('/cargar-datos')">
          <q-item-section avatar>
            <q-icon name="upload_file" />
          </q-item-section>
          <q-item-section>Cargar Datos</q-item-section>
        </q-item>

        <q-item clickable @click="goTo('/transacciones')">
          <q-item-section avatar>
            <q-icon name="list_alt" />
          </q-item-section>
          <q-item-section>Transacciones</q-item-section>
        </q-item>

        <q-item clickable @click="goTo('/reportes')">
          <q-item-section avatar>
            <q-icon name="assessment" />
          </q-item-section>
          <q-item-section>Reportes</q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <q-item-label header>Configuración</q-item-label>

        <q-item clickable @click="showSettingsDialog = true" v-close-popup>
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>Apariencia</q-item-section>
        </q-item>

        <q-item clickable v-close-popup>
          <q-item-section avatar>
            <q-icon name="help" />
          </q-item-section>
          <q-item-section>Ayuda</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />

      <!-- Footer profesional -->
      <footer class="footer-section">
        <div class="footer-content">
          <div class="row justify-between q-py-lg">
            <div class="col-12 col-sm-4 text-center text-sm-left q-mb-md q-mb-sm-none">
              <div class="text-weight-bold q-mb-sm footer-title">Sistema Contable</div>
              <div class="text-caption footer-link">Acerca de</div>
              <div class="text-caption footer-link">Términos de uso</div>
              <div class="text-caption footer-link">Privacidad</div>
            </div>
            <div class="col-12 col-sm-4 text-center q-mb-md q-mb-sm-none">
              <div class="text-weight-bold q-mb-sm footer-title">Ayuda</div>
              <div class="text-caption footer-link">Documentación</div>
              <div class="text-caption footer-link">Soporte técnico</div>
              <div class="text-caption footer-link">FAQ</div>
            </div>
            <div class="col-12 col-sm-4 text-center text-sm-right">
              <div class="text-weight-bold q-mb-sm footer-title">Contacto</div>
              <div class="q-gutter-xs">
                <q-btn round dense flat icon="email" class="footer-social-btn">
                  <q-tooltip>Correo</q-tooltip>
                </q-btn>
                <q-btn round dense flat icon="phone" class="footer-social-btn">
                  <q-tooltip>Teléfono</q-tooltip>
                </q-btn>
                <q-btn round dense flat icon="help" class="footer-social-btn">
                  <q-tooltip>Soporte</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
          <q-separator class="footer-separator" />
          <div class="text-caption q-py-md text-center footer-copyright">
            © 2025 Sistema Contable - Universidad de El Salvador
          </div>
        </div>
      </footer>
    </q-page-container>

    <!-- Diálogo de configuración de tema -->
    <q-dialog v-model="showSettingsDialog">
      <q-card style="min-width: 400px" class="settings-card">
        <q-card-section>
          <div class="text-h5 text-white">
            <q-icon name="settings" class="q-mr-sm" />
            Configuración
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="text-subtitle1 text-white q-mb-md">
            <q-icon name="palette" class="q-mr-sm" />
            Apariencia
          </div>

          <q-option-group
            v-model="themeMode"
            :options="themeOptions"
            color="primary"
            @update:model-value="changeTheme"
            class="theme-options"
          >
            <template v-slot:label="opt">
              <div class="row items-center full-width">
                <q-icon :name="opt.icon" size="sm" class="q-mr-md" />
                <div class="col">
                  <div class="text-white">{{ opt.label }}</div>
                  <div class="text-caption text-grey-5">{{ opt.description }}</div>
                </div>
              </div>
            </template>
          </q-option-group>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()
const leftDrawerOpen = ref(false)
const showSettingsDialog = ref(false)
const themeMode = ref('auto')

// Función de navegación que fuerza la actualización
function goTo(path) {
  leftDrawerOpen.value = false
  // Usar router push y luego forzar recarga completa
  router.push(path).then(() => {
    // Forzar recarga del componente
    window.location.reload()
  })
}

const themeOptions = [
  {
    label: 'Automático',
    value: 'auto',
    icon: 'brightness_auto',
    description: 'Usar tema del sistema',
  },
  {
    label: 'Modo claro',
    value: 'light',
    icon: 'light_mode',
    description: 'Tema claro siempre',
  },
  {
    label: 'Modo oscuro',
    value: 'dark',
    icon: 'dark_mode',
    description: 'Tema oscuro siempre',
  },
]

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function changeTheme(mode) {
  // Guardar preferencia
  localStorage.setItem('theme-mode', mode)

  // Aplicar tema
  if (mode === 'auto') {
    $q.dark.set('auto')
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.body.classList.remove('body--dark', 'body--light')
    document.body.classList.add(isDark ? 'body--dark' : 'body--light')
  } else if (mode === 'dark') {
    $q.dark.set(true)
    document.body.classList.remove('body--dark', 'body--light')
    document.body.classList.add('body--dark')
  } else {
    $q.dark.set(false)
    document.body.classList.remove('body--dark', 'body--light')
    document.body.classList.add('body--light')
  }
}

onMounted(() => {
  // Cargar tema guardado
  const savedTheme = localStorage.getItem('theme-mode') || 'auto'
  themeMode.value = savedTheme
  changeTheme(savedTheme)
})
</script>

<style scoped lang="scss">
// Estilos del footer - Modo oscuro
.body--dark .footer-section {
  margin-top: 4rem;
  padding: 0;
  background: #0a0e1a;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.5);
  width: 100%;
}

.body--dark .footer-title {
  color: #ffffff !important;
}

.body--dark .footer-link {
  color: rgba(255, 255, 255, 0.7) !important;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: rgba(255, 255, 255, 1) !important;
  }
}

.body--dark .footer-social-btn {
  color: #ffffff !important;

  &:hover {
    background: rgba(255, 255, 255, 0.1) !important;
  }
}

.body--dark .footer-separator {
  background: rgba(255, 255, 255, 0.15) !important;
  margin: 0.5rem 0;
}

.body--dark .footer-copyright {
  color: rgba(255, 255, 255, 0.6) !important;
}

// Estilos del footer - Modo claro
.body--light .footer-section {
  margin-top: 4rem;
  padding: 0;
  background: #f8fafc;
  border-top: 1px solid rgba(59, 130, 246, 0.2);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.body--light .footer-title {
  color: #3b82f6 !important;
}

.body--light .footer-link {
  color: #64748b !important;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #3b82f6 !important;
  }
}

.body--light .footer-social-btn {
  color: #3b82f6 !important;

  &:hover {
    background: rgba(59, 130, 246, 0.1) !important;
  }
}

.body--light .footer-separator {
  background: rgba(59, 130, 246, 0.2) !important;
  margin: 0.5rem 0;
}

.body--light .footer-copyright {
  color: #94a3b8 !important;
}

.footer-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
}

.footer-link {
  display: block;
  margin-bottom: 0.25rem;
}

// Estilos del diálogo de configuración
.settings-card {
  .theme-options {
    .q-radio {
      width: 100%;
      padding: 12px;
      border-radius: 12px;
      margin-bottom: 8px;
      transition: background-color 0.15s ease;
    }
  }
}

.body--dark .settings-card {
  .theme-options .q-radio:hover {
    background: rgba(255, 255, 255, 0.08);
  }
}

.body--light .settings-card {
  .theme-options .q-radio:hover {
    background: rgba(59, 130, 246, 0.08);
  }
}
</style>
