// Tabela de dados reutilizável.
// - columns: [{ key, label, num }]
// - rows: objetos cujas chaves batem com column.key
// Um valor de célula no formato { label, tone } vira uma tag de status.
function Cell({ col, value }) {
  if (value && typeof value === 'object' && 'label' in value) {
    return (
      <span className={`tag ${value.tone}`}>
        <span className="d" />
        {value.label}
      </span>
    )
  }
  return <>{value}</>
}

export default function DataTable({ columns, rows, caption }) {
  return (
    <table className="tbl">
      {caption && <caption className="sr-only">{caption}</caption>}
      <thead>
        <tr>
          {columns.map((c) => (
            <th key={c.key} scope="col">{c.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row.id || i}>
            {columns.map((c) => {
              const cls = [c.num ? 'num' : '', c.key === 'id' ? 'id' : ''].filter(Boolean).join(' ')
              return (
                <td key={c.key} className={cls || undefined}>
                  <Cell col={c} value={row[c.key]} />
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
