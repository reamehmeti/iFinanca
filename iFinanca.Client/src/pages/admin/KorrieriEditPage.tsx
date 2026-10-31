import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiRequest, type Korrieri, type KorrieriForm } from '../../api'
import KorrieriFields from '../../components/KorrieriFields'
import { useApi } from '../../hooks/useApi'

function KorrieriEditPage() {
    const { id } = useParams()
    const { data: korrieri, loading, error } = useApi<Korrieri>(`/api/admin/korrierat/${id}`)

    if (loading) {
        return <p className="muted">Duke ngarkuar...</p>
    }

    if (!korrieri) {
        return (
            <p className="login-message" role="status">
                {error || 'Korrieri nuk u gjet.'}
            </p>
        )
    }

    return <KorrieriEditForm key={korrieri.korrieriID} korrieri={korrieri} />
}

function KorrieriEditForm({ korrieri }: { korrieri: Korrieri }) {
    const navigate = useNavigate()
    const [form, setForm] = useState<KorrieriForm>({
        emri: korrieri.emri,
        mbiemri: korrieri.mbiemri,
        numriTelefonit: korrieri.numriTelefonit,
        posta: korrieri.posta,
        qyteti: korrieri.qyteti ?? '',
        targaEAutomjetit: korrieri.targaEAutomjetit ?? '',
        aktiv: korrieri.aktiv,
    })
    const [message, setMessage] = useState('')
    const [saving, setSaving] = useState(false)
    const name = `${korrieri.emri} ${korrieri.mbiemri}`

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setMessage('')
        setSaving(true)

        const result = await apiRequest(`/api/admin/korrierat/${korrieri.korrieriID}`, 'PUT', form)
        setSaving(false)

        if (result.ok) {
            navigate('/admin/korrierat', {
                state: { message: `Korrieri ${form.emri} ${form.mbiemri} u ruajt.` },
            })
        } else {
            setMessage(result.message)
        }
    }

    async function handleDelete() {
        if (!window.confirm(`Fshi korrierin ${name}? Do të fshihet edhe llogaria e tij (${korrieri.email}).`)) {
            return
        }

        const result = await apiRequest(`/api/admin/korrierat/${korrieri.korrieriID}`, 'DELETE')

        if (result.ok) {
            navigate('/admin/korrierat', { state: { message: `Korrieri ${name} u fshi.` } })
        } else {
            setMessage(result.message)
        }
    }

    return (
        <>
            <div className="dashboard-title">
                <div>
                    <h1>Edito korrierin</h1>
                    <p className="subtitle-left">
                        #{korrieri.korrieriID} · {korrieri.email}
                    </p>
                </div>
                <Link to={`/admin/users/${korrieri.userId}`} className="button-secondary">
                    Llogaria (email, fjalëkalimi) →
                </Link>
            </div>

            <form className="panel form-panel" onSubmit={handleSubmit}>
                <h2>Të dhënat e korrierit</h2>
                <div className="form-grid">
                    <KorrieriFields value={form} onChange={setForm} />
                </div>

                {message && (
                    <p className="login-message" role="status">
                        {message}
                    </p>
                )}

                <div className="form-actions">
                    <button type="button" className="button-danger form-actions-left" onClick={handleDelete}>
                        Fshij korrierin
                    </button>
                    <Link to="/admin/korrierat" className="button-secondary">
                        Anulo
                    </Link>
                    <button type="submit" className="button-primary" disabled={saving}>
                        {saving ? 'Duke ruajtur...' : 'Ruaj ndryshimet'}
                    </button>
                </div>
            </form>
        </>
    )
}

export default KorrieriEditPage
