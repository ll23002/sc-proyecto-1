# Sistema Contable con Clasificación Automática - Frontend

Diego Arturo Ortez Castillo OC22002
Francisco Manuel Calderón Sandoval CS23038
Nelson Adalid Orantes Mendoza OM23011
Samuel Alexander López López LL23002


Sistema contable básico desarrollado con Quasar Framework (Vue 3) que permite gestionar transacciones contables con clasificación automática mediante LLMs.

## 🚀 Características Implementadas

### ✅ Funcionalidades Principales

1. **Carga de Datos**
   - Interfaz para subir archivos Excel (.xlsx)
   - Vista previa de datos cargados
   - Simulación de clasificación automática con LLM

2. **Gestión de Transacciones (CRUD)**
   - Listar todas las transacciones
   - Agregar nuevas transacciones manualmente
   - Editar transacciones existentes
   - Eliminar transacciones
   - Filtros por periodo (mensual, trimestral, anual)

3. **Validación de Balance Contable**
   - Verificación que Debe = Haber
   - Detección de errores en transacciones
   - Resumen visual del balance

4. **Generación de Reportes**
   - Libro Diario
   - Libro Mayor
   - Balance General
   - Estado de Resultados
   - Exportación a HTML (listo para impresión)
   - Exportación a Excel (simulada)

## 📋 Requisitos Previos

- Node.js >= 20
- npm >= 6.13.4

## 🔧 Instalación

```bash
# Instalar dependencias
npm install
```

## 🏃 Ejecución en Modo Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: `http://localhost:9000/`

## 🏗️ Construcción para Producción

```bash
# Compilar para producción
npm run build
```

## 📁 Estructura del Proyecto

```
src/
├── layouts/
│   └── MainLayout.vue          # Layout principal con menú de navegación
├── pages/
│   ├── IndexPage.vue           # Página de inicio
│   ├── LoadDataPage.vue        # Carga de datos desde Excel
│   ├── TransactionsPage.vue    # CRUD de transacciones
│   ├── BalancePage.vue         # Validación de balance
│   └── ReportsPage.vue         # Generación de reportes
├── composables/
│   └── useTransactions.js      # Store reactivo de transacciones
├── router/
│   └── routes.js               # Configuración de rutas
└── App.vue                     # Componente raíz
```

## 🎯 Uso del Sistema

### 1. Cargar Datos

1. Ir a "Cargar Datos" en el menú lateral
2. Seleccionar un archivo Excel con la estructura:
   - Fecha (YYYY-MM-DD)
   - Descripción
   - Monto
   - Moneda
3. Procesar archivo y enviar al backend para clasificación

### 2. Gestionar Transacciones

1. Ir a "Transacciones"
2. Ver, editar o eliminar transacciones clasificadas
3. Agregar nuevas transacciones manualmente
4. Aplicar filtros por periodo (año, mes, trimestre)

### 3. Validar Balance

1. Ir a "Validar Balance"
2. Presionar el botón "Validar Balance"
3. Ver resultados: Debe, Haber, Diferencia
4. Revisar errores detectados (si los hay)

### 4. Generar Reportes

1. Ir a "Reportes"
2. Seleccionar tipo de reporte:
   - Libro Diario
   - Libro Mayor
   - Balance General
   - Estado de Resultados
3. Exportar en formato Excel o HTML

## 🔌 Integración con Backend

El frontend está preparado para conectarse con un backend que:

- Reciba archivos Excel y retorne datos procesados
- Clasifique transacciones usando LLM (GPT-4o-mini, Claude Haiku, etc.)
- Asigne automáticamente:
  - Tipo (Ingreso/Egreso)
  - Categoría (Ventas, Compras, Servicios, etc.)
  - Cuenta contable del catálogo de El Salvador
  - Valores Debe/Haber

### Endpoints Esperados (Para Implementar en Backend)

```javascript
// POST /api/upload - Subir archivo Excel
// POST /api/classify - Clasificar transacciones con LLM
// GET /api/transactions - Obtener todas las transacciones
// POST /api/transactions - Crear nueva transacción
// PUT /api/transactions/:id - Actualizar transacción
// DELETE /api/transactions/:id - Eliminar transacción
// GET /api/balance - Validar balance
// GET /api/reports/:type - Generar reportes
```

## 🐛 Características Simuladas

Actualmente, las siguientes funcionalidades están **simuladas** hasta que se implemente el backend:

- Procesamiento real de archivos Excel (usa datos de ejemplo)
- Clasificación con LLM (usa lógica simple basada en palabras clave)
- Exportación a Excel real (muestra notificación simulada)
- Persistencia de datos (los datos se mantienen solo en memoria durante la sesión)

## 🎨 Tecnologías Utilizadas

- **Quasar Framework v2** - Framework UI basado en Vue 3
- **Vue 3** - Framework JavaScript progresivo
- **Vue Router** - Enrutamiento oficial de Vue
- **Composables** - Para manejo de estado reactivo

## 📝 Notas para Desarrollo

1. **Estado de Transacciones**: Actualmente se maneja en memoria usando composables. Para producción, conectar con backend o usar Pinia/Vuex.

2. **Procesamiento de Excel**: Implementar usando librerías como:
   - `xlsx` (SheetJS) para lectura de archivos
   - `file-saver` para descarga de reportes

3. **Variables de Entorno**: Crear archivo `.env` para configurar:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

## 👥 Equipo de Desarrollo

Proyecto desarrollado para el curso de Sistemas Contables.

## 📄 Licencia

Proyecto académico - Universidad de El Salvador
