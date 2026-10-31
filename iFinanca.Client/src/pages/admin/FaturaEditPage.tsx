import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
    apiRequest,
    faturaNumber,
    STATUS_LABELS,
    STATUSET,
    type Fatura,
    type FaturaForm,
    type Klienti,
    type Korrieri,
    type Statusi,
} from '../../api'
import { useApi } from '../../hooks/useApi'

const emptyFatura: FaturaForm = {
    klientiID: 0,
    korrieriID: 0,
    pershkrimi: '',
    cmimi: '',
    statusi: 'EKrijuar',
}

function FaturaEditPage() {
    const { id } = useParams()
    const isNew = id === 'new'
    const { data: fatura, loading, error } = useApi<Fatura>(isNew ? null : `/api/faturat/${id}`)
    const { data: klientet } = useApi<Klienti[]>('/api/admin/klientet')
    const { data: korrierat } = useApi<Korrieri[]>('/api/admin/korrierat')

    if (!isNew && loading) {
        return <p className="muted">Duke ngarkuar...</p>
    }

    if (!isNew && !fatura) {
        return (
            <p className="login-message" role="status">
                {error || 'Fatura nuk u gjet.'}
            </p>
        )
    }

    return (
        <FaturaFormView
            key={fatura?.faturaID ?? 'new'}
            fatura={isNew ? null : fatura}
            klientet={klientet ?? []}
            korrierat={korrierat ?? []}
        />
    )
}

type FaturaFormViewProps = {
    fatura: Fatura | null
    klientet: Klienti[]
    korrierat: Korrieri[]
}

function FaturaFormView({ fatura, klientet, korrierat }: FaturaFormViewProps) {
    const navigate = useNavigate()
    const [form, setForm] = useState<FaturaForm>(
        fatura
            ? {
                  klientiID: fatura.klientiID,
                  korrieriID: fatura.korrieriID,
                  pershkrimi: fatura.pershkrimi,
                  cmimi: String(fatura.cmimi),
                  statusi: fatura.statusi,
              }
            : emptyFatura
    )
    const [message, setMessage] = useState('')
    const [saving, setSaving] = useState(false)

    const courierOptions = korrierat.filter(
        (korrieri) => korrieri.aktiv || korrieri.korrieriID === fatura?.korrieriID
    )

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setMessage('')
        setSaving(true)

        const body = { ...form, cmimi: Number(form.cmimi.replace(',', '.')) }

        if (fatura) {
            const result = await apiRequest(`/api/faturat/${fatura.faturaID}`, 'PUT', body)
            setSaving(false)

            if (result.ok) {
                const message = `Fatura ${faturaNumber(fatura.faturaID)} u ruajt me sukses.`
                navigate('/admin/faturat', { state: { message } })
            } else {
                setMessage(result.message)
            }
        } else {
            const result = await apiRequest<{ faturaID: number }>('/api/faturat', 'POST', body)
            setSaving(false)

            if (result.ok && result.data) {
                const message = `Fatura ${faturaNumber(result.data.faturaID)} u krijua me sukses.`
                navigate('/admin/faturat', { state: { message } })
            } else {
                setMessage(result.message)
            }
        }
    }

    return (
        <>
            <div className="dashboard-title">
                <div>
                    <h1>{fatura ? `Fatura ${faturaNumber(fatura.faturaID)}` : 'Krijo faturë'}</h1>
                    <p className="subtitle-left">
                        {fatura ? `${fatura.emriIKompanise} · ${fatura.korrieriEmri}` : 'Plotëso të dhënat e faturës.'}
                    </p>
                </div>
                {fatura && (
                    <a href={`/api/faturat/${fatura.faturaID}/pdf`} className="button-secondary" download>
                        Shkarko PDF
                    </a>
                )}
            </div>

            <form className="panel form-panel" onSubmit={handleSubmit}>
                <h2>Fatura</h2>
                <div className="form-grid">
                    <div className="form-field">
                        <label htmlFor="klienti">
                            Klienti<span className="required-mark"> *</span>
                        </label>
                        <select
                            id="klienti"
                            value={form.klientiID || ''}
                            onChange={(event) => setForm({ ...form, klientiID: Number(event.target.value) })}
                            required
                        >
                            <option value="" disabled>
                                Zgjidh klientin...
                            </option>
                            {klientet.map((klienti) => (
                                <option key={klienti.klientiID} value={klienti.klientiID}>
                                    {klienti.emriIKompanise}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-field">
                        <label htmlFor="korrieri">
                            Korrieri<span className="required-mark"> *</span>
                        </label>
                        <select
                            id="korrieri"
                            value={form.korrieriID || ''}
                            onChange={(event) => setForm({ ...form, korrieriID: Number(event.target.value) })}
                            required
                        >
                            <option value="" disabled>
                                Zgjidh korrierin aktiv...
                            </option>
                            {courierOptions.map((korrieri) => (
                                <option key={korrieri.korrieriID} value={korrieri.korrieriID}>
                                    {korrieri.emri} {korrieri.mbiemri} · {korrieri.posta}
                                    {korrieri.aktiv ? '' : ' (joaktiv)'}
                                </option>
                            ))}
                        </select>
                        <small className="field-hint">Shfaqen vetëm korrierët aktivë.</small>
                    </div>

                    <div className="form-field form-field-wide">
                        <label htmlFor="pershkrimi">
                            Përshkrimi<span className="required-mark"> *</span>
                        </label>
                        <textarea
                            id="pershkrimi"
                            rows={3}
                            maxLength={500}
                            value={form.pershkrimi}
                            onChange={(event) => setForm({ ...form, pershkrimi: event.target.value })}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="cmimi">
                            Çmimi (€)<span className="required-mark"> *</span>
                        </label>
                        <input
                            id="cmimi"
                            type="number"
                            min="0"
                            step="0.01"
                            inputMode="decimal"
                            value={form.cmimi}
                            onChange={(event) => setForm({ ...form, cmimi: event.target.value })}
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="statusi">Statusi</label>
                        <select
                            id="statusi"
                            className={`status-select status-${form.statusi}`}
                            value={form.statusi}
                            onChange={(event) => setForm({ ...form, statusi: event.target.value as Statusi })}
                        >
                            {STATUSET.map((statusi) => (
                                <option key={statusi} value={statusi}>
                                    {STATUS_LABELS[statusi]}
                                </option>
                            ))}
                        </select>
                        <small className="field-hint">
                            Si administrator mund ta korrigjosh statusin në çdo moment.
                        </small>
                    </div>
                </div>

                {message && (
                    <p className="login-message" role="status">
                        {message}
                    </p>
                )}

                <div className="form-actions">
                    <Link to="/admin/faturat" className="button-secondary">
                        Anulo
                    </Link>
                    <button type="submit" className="button-primary" disabled={saving}>
                        {saving ? 'Duke ruajtur...' : fatura ? 'Ruaj ndryshimet' : 'Krijo faturën'}
                    </button>
                </div>
            </form>
        </>
    )
}

export default FaturaEditPage
