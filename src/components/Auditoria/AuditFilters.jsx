import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { registerLocale } from 'react-datepicker'
import ptBR from 'date-fns/locale/pt-BR'
import './Auditoria.css'
import PropTypes from 'prop-types'

registerLocale('pt-BR', ptBR)

export default function AuditFilters({ from, to, onFromChange, onToChange }) {
  return (
    <div className="audit-filters">
      <div className="audit-filters__group">
        <label className="audit-filters__label">De</label>
        <DatePicker
          selected={from}
          onChange={onFromChange}
          selectsStart
          startDate={from}
          endDate={to}
          maxDate={to || new Date()}
          dateFormat="dd/MM/yyyy"
          locale="pt-BR"
          placeholderText="Data inicial"
          className="audit-datepicker"
          isClearable
        />
      </div>
      <div className="audit-filters__group">
        <label className="audit-filters__label">Até</label>
        <DatePicker
          selected={to}
          onChange={onToChange}
          selectsEnd
          startDate={from}
          endDate={to}
          minDate={from}
          maxDate={new Date()}
          dateFormat="dd/MM/yyyy"
          locale="pt-BR"
          placeholderText="Data final"
          className="audit-datepicker"
          isClearable
        />
      </div>
    </div>
  )
}

AuditFilters.propTypes = {
  from: PropTypes.instanceOf(Date),
  to: PropTypes.instanceOf(Date),
  onFromChange: PropTypes.func.isRequired,
  onToChange: PropTypes.func.isRequired,
}