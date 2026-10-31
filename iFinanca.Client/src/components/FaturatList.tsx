import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
    apiRequest,
    faturaNumber,
    formatDate,
    formatMoney,
    nextStep,
    nextStepLabel,
    STATUS_LABELS,
    STATUSET,
    type Fatura,
    type Statusi,
} from '../api'
import { useAuth } from '../auth/authContext'
import { useApi } from '../hooks/useApi'
import { useFlashMessage } from '../hooks/useFlashMessage'
import StatusBadge from './StatusBadge'

type FaturatListProps = {
    admin?: boolean
}

type Filter = Statusi | '' | 'veprim'

function FaturatList({ admin = false }: FaturatListProps) {
    const { user } = useAuth()
    const { data: faturat, loading, error, reload } = useApi<Fatura[]>('/api/faturat')
    const [message, setMessage] = useFlashMessage()
    const [filter, setFilter] = useState<Filter>('')
    const [savingId, setSavingId] = useState<number | null>(null)

    const allFaturat = faturat ?? []
    const waitingForMe = allFaturat.filter((fatura) => nextStep(fatura) !== null)

    let filteredFaturat = allFaturat

    if (filter === 'veprim') {
        filteredFaturat = waitingForMe
    } else if (filter !== '') {
        filteredFaturat = allFaturat.filter((fatura) => fatura.statusi === filter)
    }

    async function handleNextStep(fatura: Fatura, statusi: Statusi) {
        // Korrieri dhe klienti nuk mund ta kthejnë këtë hap, prandaj kërkojmë konfirmim.
        const cannotUndo = !admin && (statusi === 'EPranuar' || statusi === 'EPaguar')

        if (cannotUndo) {
            const question =
                `Fatura ${faturaNumber(fatura.faturaID)}: "${nextStepLabel(statusi, user?.role ?? null)}"?\n` +
                'Pas këtij hapi nuk mund ta ndryshosh më statusin.'

            if (!window.confirm(question)) {
                return
            }
        }

        setMessage('')
        setSavingId(fatura.faturaID)

        const result = await apiRequest(`/api/faturat/${fatura.faturaID}/statusi`, 'PATCH', { statusi })

        if (result.ok) {
            setMessage(`Fatura ${faturaNumber(fatura.faturaID)}: statusi u ndryshua në "${STATUS_LABELS[statusi]}".`)
        } else {
            setMessage(result.message)
        }

        setSavingId(null)
        await reload()
    }

    async function handleDelete(fatura: Fatura) {
        if (!window.confirm(`Fshi faturën ${faturaNumber(fatura.faturaID)} për ${fatura.emriIKompanise}?`)) {
            return
        }

        const result = await apiRequest(`/api/faturat/${fatura.faturaID}`, 'DELETE')
        setMessage(result.ok ? `Fatura ${faturaNumber(fatura.faturaID)} u fshi.` : result.message)
        await reload()
    }

    return (
        <>
            {(message || error) && (
                <p className="login-message" role="status">
                    {message || error}
                </p>
            )}

            <div className="status-filter" role="group" aria-label="Filtro sipas statusit">
                <button
                    type="button"
                    className={filter === '' ? 'filter-chip active' : 'filter-chip'}
                    onClick={() => setFilter('')}
                >
                    Të gjitha <span>{allFaturat.length}</span>
                </button>
                <button
                    type="button"
                    className={filter === 'veprim' ? 'filter-chip filter-chip-action active' : 'filter-chip filter-chip-action'}
                    onClick={() => setFilter('veprim')}
                >
                    Presin veprimin tënd <span>{waitingForMe.length}</span>
                </button>
                {STATUSET.map((statusi) => (
                    <button
                        key={statusi}
                        type="button"
                        className={filter === statusi ? `filter-chip active status-${statusi}` : 'filter-chip'}
                        onClick={() => setFilter(statusi)}
                    >
                        <i className={`status-dot status-${statusi}`} />
                        {STATUS_LABELS[statusi]}
                        <span>{allFaturat.filter((fatura) => fatura.statusi === statusi).length}</span>
                    </button>
                ))}
            </div>

            <section className="panel">
                {loading && <p className="muted">Duke ngarkuar...</p>}

                {!loading && filteredFaturat.length === 0 && <p className="muted">Nuk ka fatura.</p>}

                {!loading && filteredFaturat.length > 0 && (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nr.</th>
                                <th>Klienti</th>
                                <th>Korrieri</th>
                                <th>Përshkrimi</th>
                                <th className="cell-number">Çmimi</th>
                                <th>Statusi</th>
                                <th>Data</th>
                                <th>Veprime</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFaturat.map((fatura) => {
                                const next = nextStep(fatura)

                                return (
                                    <tr key={fatura.faturaID}>
                                        <td className="cell-main">{faturaNumber(fatura.faturaID)}</td>
                                        <td data-label="Klienti">{fatura.emriIKompanise}</td>
                                        <td data-label="Korrieri">{fatura.korrieriEmri}</td>
                                        <td data-label="Përshkrimi" className="cell-description">
                                            {fatura.pershkrimi}
                                        </td>
                                        <td data-label="Çmimi" className="cell-number">
                                            {formatMoney(fatura.cmimi)}
                                        </td>
                                        <td>
                                            <StatusBadge statusi={fatura.statusi} />
                                        </td>
                                        <td data-label="Data">{formatDate(fatura.dataEKrijimit)}</td>
                                        <td>
                                            <div className="row-actions">
                                                {next && (
                                                    <button
                                                        type="button"
                                                        className={`button-step status-${next}`}
                                                        disabled={savingId === fatura.faturaID}
                                                        onClick={() => handleNextStep(fatura, next)}
                                                    >
                                                        {nextStepLabel(next, user?.role ?? null)} →
                                                    </button>
                                                )}
                                                <a
                                                    href={`/api/faturat/${fatura.faturaID}/pdf`}
                                                    className="button-secondary"
                                                    download
                                                >
                                                    PDF
                                                </a>
                                                {admin && (
                                                    <>
                                                        <Link
                                                            to={`/admin/faturat/${fatura.faturaID}`}
                                                            className="button-secondary"
                                                        >
                                                            Edito
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            className="button-danger"
                                                            onClick={() => handleDelete(fatura)}
                                                        >
                                                            Fshij
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </section>
        </>
    )
}

export default FaturatList
