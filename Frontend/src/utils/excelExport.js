import * as XLSX from 'xlsx'

export function exportToExcel(data, filename = 'reporte.xlsx', sheetName = 'Datos') {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, filename)
}

export function generateLibroDiarioExcel(transactions) {
  const data = transactions.map((t) => ({
    Fecha: t.fecha,
    Descripción: t.descripcion,
    'Cuenta Contable': t.clasificacion_cuenta || 'N/A',
    Debe: t.clasificacion_tipo === 'EGRESO' ? t.monto : 0,
    Haber: t.clasificacion_tipo === 'INGRESO' ? t.monto : 0,
    Moneda: t.moneda,
  }))
  exportToExcel(data, 'libro_diario.xlsx', 'Libro Diario')
}

export function generateLibroMayorExcel(transactions) {
  const groupedByAccount = {}

  transactions.forEach((t) => {
    const cuenta = t.clasificacion_cuenta || 'Sin Cuenta'
    if (!groupedByAccount[cuenta]) {
      groupedByAccount[cuenta] = []
    }
    groupedByAccount[cuenta].push({
      Fecha: t.fecha,
      Descripción: t.descripcion,
      Debe: t.clasificacion_tipo === 'EGRESO' ? t.monto : 0,
      Haber: t.clasificacion_tipo === 'INGRESO' ? t.monto : 0,
    })
  })

  const data = []
  Object.entries(groupedByAccount).forEach(([cuenta, trans]) => {
    data.push({ Fecha: '', Descripción: `CUENTA: ${cuenta}`, Debe: '', Haber: '' })
    data.push(...trans)
    data.push({ Fecha: '', Descripción: '', Debe: '', Haber: '' })
  })

  exportToExcel(data, 'libro_mayor.xlsx', 'Libro Mayor')
}

export function generateBalanceGeneralExcel(transactions) {
  const balanceByAccount = {}

  transactions.forEach((t) => {
    const cuenta = t.clasificacion_cuenta || 'Sin Cuenta'
    if (!balanceByAccount[cuenta]) {
      balanceByAccount[cuenta] = { debe: 0, haber: 0 }
    }
    if (t.clasificacion_tipo === 'EGRESO') {
      balanceByAccount[cuenta].debe += parseFloat(t.monto)
    } else if (t.clasificacion_tipo === 'INGRESO') {
      balanceByAccount[cuenta].haber += parseFloat(t.monto)
    }
  })

  const data = Object.entries(balanceByAccount).map(([cuenta, balance]) => ({
    'Cuenta Contable': cuenta,
    Debe: balance.debe.toFixed(2),
    Haber: balance.haber.toFixed(2),
    Saldo: (balance.debe - balance.haber).toFixed(2),
  }))

  exportToExcel(data, 'balance_general.xlsx', 'Balance General')
}

export function generateEstadoResultadosExcel(transactions) {
  const ingresos = transactions
    .filter((t) => t.clasificacion_tipo === 'INGRESO')
    .reduce((sum, t) => sum + parseFloat(t.monto), 0)

  const egresos = transactions
    .filter((t) => t.clasificacion_tipo === 'EGRESO')
    .reduce((sum, t) => sum + parseFloat(t.monto), 0)

  const data = [
    { Concepto: 'Total Ingresos', Monto: ingresos.toFixed(2) },
    { Concepto: 'Total Egresos', Monto: egresos.toFixed(2) },
    { Concepto: 'Utilidad/Pérdida', Monto: (ingresos - egresos).toFixed(2) },
  ]

  exportToExcel(data, 'estado_resultados.xlsx', 'Estado de Resultados')
}
