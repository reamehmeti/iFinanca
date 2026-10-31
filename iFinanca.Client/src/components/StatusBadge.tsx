import { STATUS_LABELS, type Statusi } from '../api'

function StatusBadge({ statusi }: { statusi: Statusi }) {
    return <span className={`fatura-status status-${statusi}`}>{STATUS_LABELS[statusi]}</span>
}

export default StatusBadge
