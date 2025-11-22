<template>
  <q-page class="index-page">
    <div class="page-container">
      <!-- Hero Section -->
      <div class="hero-section q-mb-xl">
        <div class="text-h3 text-weight-bold q-mb-sm hero-title">Sistema Contable</div>
        <div class="text-h6 hero-subtitle">Clasificación Automática mediante LLMs</div>
        <q-separator class="q-my-md hero-separator" />
        <p class="text-body1 hero-description">
          Gestione sus transacciones contables de forma eficiente con clasificación automática
        </p>
      </div>

      <!-- Quick Actions -->
      <div class="row q-col-gutter-lg q-mb-xl">
        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="action-card cursor-pointer" @click="goTo('/cargar-datos')">
            <q-card-section class="text-center">
              <q-icon name="upload_file" size="56px" color="primary" class="q-mb-md" />
              <div class="text-h6 q-mb-xs card-title">Cargar Datos</div>
              <div class="text-caption card-subtitle">Suba un archivo Excel</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="action-card cursor-pointer" @click="goTo('/transacciones')">
            <q-card-section class="text-center">
              <q-icon name="list_alt" size="56px" color="primary" class="q-mb-md" />
              <div class="text-h6 q-mb-xs card-title">Transacciones</div>
              <div class="text-caption card-subtitle">Gestionar registros</div>
            </q-card-section>
          </q-card>
        </div>


        <div class="col-12 col-sm-6 col-md-3">
          <q-card class="action-card cursor-pointer" @click="goTo('/reportes')">
            <q-card-section class="text-center">
              <q-icon name="assessment" size="56px" color="secondary" class="q-mb-md" />
              <div class="text-h6 q-mb-xs card-title">Reportes</div>
              <div class="text-caption card-subtitle">Exportar datos</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Features Section -->
      <div class="features-section">
        <div class="text-h5 text-weight-medium q-mb-lg text-center features-title">
          Características Principales
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-card flat bordered class="feature-card">
              <q-card-section>
                <q-icon name="smart_toy" size="32px" color="primary" class="q-mb-sm" />
                <div class="text-subtitle1 text-weight-medium q-mb-xs feature-title">
                  Clasificación Inteligente
                </div>
                <div class="text-body2 feature-description">
                  Utiliza modelos de lenguaje para clasificar automáticamente sus transacciones
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card flat bordered class="feature-card">
              <q-card-section>
                <q-icon name="edit_note" size="32px" color="primary" class="q-mb-sm" />
                <div class="text-subtitle1 text-weight-medium q-mb-xs feature-title">
                  CRUD Completo
                </div>
                <div class="text-body2 feature-description">
                  Agregue, edite y elimine transacciones con facilidad
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card flat bordered class="feature-card">
              <q-card-section>
                <q-icon name="filter_alt" size="32px" color="primary" class="q-mb-sm" />
                <div class="text-subtitle1 text-weight-medium q-mb-xs feature-title">
                  Filtros Avanzados
                </div>
                <div class="text-body2 feature-description">
                  Filtre por periodo: mensual, trimestral o anual
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card flat bordered class="feature-card">
              <q-card-section>
                <q-icon name="balance" size="32px" color="positive" class="q-mb-sm" />
                <div class="text-subtitle1 text-weight-medium q-mb-xs feature-title">
                  Validación de Balance
                </div>
                <div class="text-body2 feature-description">
                  Verifique que el Debe y el Haber cuadren correctamente
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card flat bordered class="feature-card">
              <q-card-section>
                <q-icon name="description" size="32px" color="secondary" class="q-mb-sm" />
                <div class="text-subtitle1 text-weight-medium q-mb-xs feature-title">
                  Múltiples Reportes
                </div>
                <div class="text-body2 feature-description">
                  Libro Diario, Mayor, Balance General y Estado de Resultados
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-4">
            <q-card flat bordered class="feature-card">
              <q-card-section>
                <q-icon name="file_download" size="32px" color="secondary" class="q-mb-sm" />
                <div class="text-subtitle1 text-weight-medium q-mb-xs feature-title">
                  Exportación Flexible
                </div>
                <div class="text-body2 feature-description">
                  Exporte sus reportes en formato Excel o HTML
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goTo(path) {
  router.push(path).then(() => {
    window.location.reload()
  })
}
</script>

<style scoped lang="scss">
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.hero-section {
  text-align: center;
  padding: 2rem 0;
}

.hero-separator {
  max-width: 100px;
  margin-left: auto;
  margin-right: auto;
}

// Colores que se adaptan al tema
.body--dark {
  .hero-title,
  .features-title {
    color: rgba(255, 255, 255, 0.95) !important;
  }

  .hero-subtitle {
    color: rgba(255, 255, 255, 0.7) !important;
  }

  .hero-description {
    color: rgba(255, 255, 255, 0.6) !important;
  }

  .card-title,
  .feature-title {
    color: rgba(255, 255, 255, 0.9) !important;
  }

  .card-subtitle,
  .feature-description {
    color: rgba(255, 255, 255, 0.6) !important;
  }
}

.body--light {
  .hero-title,
  .features-title {
    color: #020617 !important;
  }

  .hero-subtitle {
    color: #64748b !important;
  }

  .hero-description {
    color: #475569 !important;
  }

  .card-title,
  .feature-title {
    color: #020617 !important;
  }

  .card-subtitle,
  .feature-description {
    color: #64748b !important;
  }
}

.action-card {
  transition: all 0.3s ease;
  height: 100%;

  &:hover {
    transform: translateY(-8px) scale(1.02);
  }

  .q-card-section {
    padding: 2rem 1rem;
  }
}

.feature-card {
  height: 100%;

  .q-card-section {
    height: 100%;
  }
}

.features-section {
  margin-top: 3rem;
  margin-bottom: 3rem;
}

@media (max-width: 599px) {
  .hero-section {
    padding: 1rem 0;

    .text-h3 {
      font-size: 1.75rem;
    }
  }

  .action-card .q-card-section {
    padding: 1.5rem 1rem;
  }
}
</style>
