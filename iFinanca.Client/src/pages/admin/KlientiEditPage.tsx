import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiRequest, type Klienti, type KlientiForm } from '../../api'
import KlientiFields from '../../components/KlientiFields'
import { useApi } from '../../hooks/useApi'

function KlientiEditPage() {
    const { id } = useParams()
    const { data: klienti, loading, error } = useApi<Klienti>(`/api/admin/klientet/${id}`)

    if (loading) {
        return <p className="muted">Duke ngarkuar...</p>
    }

    if (!klienti) {
        return (
            <p className="login-message" role="status">
                {error || 'Klienti nuk u gjet.'}
            </p>
        )
    }

    return <KlientiEditForm key={klienti.klientiID} klienti={klienti} />
}

function KlientiEditForm({ klienti }: { klienti: Klienti }) {
    const navigate = useNavigate()
    const [form, setForm] = useState<KlientiForm>({
        emriIKompanise: klienti.emriIKompanise,
        personiPergjegjes: klienti.personiPergjegjes,
        adresa: klienti.adresa,
        qyteti: klienti.qyteti ?? '',
        numriTelefonit: klienti.numriTelefonit ?? '',
        nui: klienti.nui ?? '',
    })
    const [message, setMessage] = useState('')
    const [saving, setSaving] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setMessage('')
        setSaving(true)

        const result = await apiRequest(`/api/admin/klientet/${klienti.klientiID}`, 'PUT', form)
        setSaving(false)

        if (result.ok) {
            navigate('/admin/klientet', {
                state: { message: `Klienti ${form.emriIKompanise} u ruajt.` },
            })
        } else {
            setMessage(result.message)
        }
    }

    async function handleDelete() {
        if (
            !window.confirm(
                `Fshi klientin ${klienti.emriIKompanise}? Do të fshihet edhe llogaria e tij (${klienti.email}).`
            )
        ) {
            return
        }

        const result = await apiRequest(`/api/admin/klientet/${klienti.klientiID}`, 'DELETE')

        if (result.ok) {
            navigate('/admin/klientet', {
                state: { message: `Klienti ${klienti.emriIKompanise} u fshi.` },
            })
        } else {
            setMessage(result.message)
        }
    }

    return (
        <>
            <div className="dashboard-title">
                <div>
                    <h1>Edito klientin</h1>
                    <p className="subtitle-left">
                        #{klienti.klientiID} · {klienti.email}
                    </p>
                </div>
                <Link to={`/admin/users/${klienti.userId}`} className="button-secondary">
                    Llogaria (email, fjalëkalimi) →
                </Link>
            </div>

            <form className="panel form-panel" onSubmit={handleSubmit}>
                <h2>Të dhënat e klientit</h2>
                <div className="form-grid">
                    <KlientiFields value={form} onChange={setForm} />
                </div>

                {message && (
                    <p className="login-message" role="status">
                        {message}
                    </p>
                )}

                <div className="form-actions">
                    <button type="button" className="button-danger form-actions-left" onClick={handleDelete}>
                        Fshij klientin
                    </button>
                    <Link to="/admin/klientet" className="button-secondary">
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

export default KlientiEditPage
