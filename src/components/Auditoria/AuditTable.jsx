import './Auditoria.css'
import PropTypes from 'prop-types'

export default function AuditTable({ columns, data, loading }) {
  const colSpan = columns.length

  return (
    <div className="audit-table-wrapper">
      <table className="audit-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.header}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={colSpan} className="audit-state">
                Carregando...
              </td>
            </tr>
          ) : data?.content?.length > 0 ? (
            data.content.map((row, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.header}>{col.render(row)}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={colSpan} className="audit-state">
                Nenhum registro encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

AuditTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      header: PropTypes.string.isRequired,
      render: PropTypes.func.isRequired,
    })
  ).isRequired,
  data: PropTypes.shape({
    content: PropTypes.array,
  }),
  loading: PropTypes.bool,
}