import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiRequest, ROLE_LABELS, type UserSummary } from '../../api'
import FormField from '../../components/FormField'
import { useApi } from '../../hooks/useApi'

function UserEditPage() {
    const { id } = useParams()
    const { data: users, loading, error } = useApi<UserSummary[]>('/api/admin/users')
    const user = users?.find((candidate) => candidate.id === id)

    if (loading) {
        return <p className="muted">Duke ngarkuar...</p>
    }

    if (!user) {
        return (
            <p className="login-message" role="status">
                {error || 'Përdoruesi nuk u gjet.'}
            </p>
        )
    }

    return <UserEditForm key={user.id} user={user} />
}

function UserEditForm({ user }: { user: UserSummary }) {
    const navigate = useNavigate()
    const [email, setEmail] = useState(user.email)
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')
    const [saving, setSaving] = useState(false)

    let detailsPath: string | null = null

    if (user.korrieriID) {
        detailsPath = `/admin/korrierat/${user.korrieriID}`
    } else if (user.klientiID) {
        detailsPath = `/admin/klientet/${user.klientiID}`
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setMessage('')

        if (newPassword !== confirmPassword) {
            setMessage('Fjalëkalimet nuk përputhen.')
            return
        }

        setSaving(true)

        const result = await apiRequest(`/api/admin/users/${user.id}`, 'PUT', {
            email,
            newPassword: newPassword || null,
        })

        setSaving(false)

        if (result.ok) {
            navigate('/admin/users', { state: { message: `Llogaria ${email} u ruajt.` } })
        } else {
            setMessage(result.message)
        }
    }

    return (
        <>
            <div className="dashboard-title">
                <div>
                    <h1>Edito llogarinë</h1>
                    <p className="subtitle-left">
                        {user.role ? ROLE_LABELS[user.role] : 'Pa rol'}
                        {user.name && ` · ${user.name}`}
                    </p>
                </div>
                {detailsPath && (
                    <Link to={detailsPath} className="button-secondary">
                        Të dhënat e {user.korrieriID ? 'korrierit' : 'klientit'} →
                    </Link>
                )}
            </div>

            <form className="panel form-panel" onSubmit={handleSubmit}>
                <h2>Llogaria</h2>
                <div className="form-grid">
                    <FormField
                        id="email"
                        label="Email adresa"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        autoComplete="off"
                        required
                    />
                </div>

                <h2>Fjalëkalimi i ri</h2>
                <p className="muted form-note">Lëre bosh nëse nuk dëshiron ta ndryshosh fjalëkalimin.</p>
                <div className="form-grid">
                    <FormField
                        id="new-password"
                        label="Fjalëkalimi i ri"
                        type="password"
                        value={newPassword}
                        onChange={setNewPassword}
                        autoComplete="new-password"
                    />
                    <FormField
                        id="confirm-password"
                        label="Përsërit fjalëkalimin"
                        type="password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        autoComplete="new-password"
                        required={newPassword.length > 0}
                    />
                </div>

                {message && (
                    <p className="login-message" role="status">
                        {message}
                    </p>
                )}

                <div className="form-actions">
                    <Link to="/admin/users" className="button-secondary">
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

export default UserEditPage
