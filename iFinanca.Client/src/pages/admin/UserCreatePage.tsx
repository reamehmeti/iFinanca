import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
    apiRequest,
    emptyKlienti,
    emptyKorrieri,
    ROLE_LABELS,
    ROLES,
    type KlientiForm,
    type KorrieriForm,
    type Role,
} from '../../api'
import FormField from '../../components/FormField'
import KlientiFields from '../../components/KlientiFields'
import KorrieriFields from '../../components/KorrieriFields'

function UserCreatePage() {
    const [searchParams] = useSearchParams()
    const initialRole = ROLES.find((role) => role === searchParams.get('role')) ?? 'Client'
    const navigate = useNavigate()

    const [role, setRole] = useState<Role>(initialRole)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [korrieri, setKorrieri] = useState<KorrieriForm>(emptyKorrieri)
    const [klienti, setKlienti] = useState<KlientiForm>(emptyKlienti)
    const [message, setMessage] = useState('')
    const [saving, setSaving] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setMessage('')
        setSaving(true)

        let url = '/api/admin/users'
        let body: object = { email, password }
        let listPath = '/admin/users'

        if (role === 'Courier') {
            url = '/api/admin/korrierat'
            body = { email, password, ...korrieri }
            listPath = '/admin/korrierat'
        } else if (role === 'Client') {
            url = '/api/admin/klientet'
            body = { email, password, ...klienti }
            listPath = '/admin/klientet'
        }

        const result = await apiRequest(url, 'POST', body)
        setSaving(false)

        if (result.ok) {
            navigate(listPath, {
                state: { message: `${ROLE_LABELS[role]}i ${email} u krijua me sukses.` },
            })
        } else {
            setMessage(result.message)
        }
    }

    return (
        <>
            <div className="dashboard-title">
                <div>
                    <h1>Shto përdorues</h1>
                    <p className="subtitle-left">Krijo një llogari të re dhe zgjidh rolin e saj.</p>
                </div>
            </div>

            <form className="panel form-panel" onSubmit={handleSubmit}>
                <h2>Llogaria</h2>
                <div className="form-grid">
                    <div className="form-field">
                        <label htmlFor="role">Roli</label>
                        <select id="role" value={role} onChange={(event) => setRole(event.target.value as Role)}>
                            {ROLES.map((option) => (
                                <option key={option} value={option}>
                                    {ROLE_LABELS[option]}
                                </option>
                            ))}
                        </select>
                    </div>

                    <FormField
                        id="email"
                        label="Email adresa"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        autoComplete="off"
                        placeholder="user@example.com"
                        required
                    />

                    <div className="form-field">
                        <label htmlFor="password">
                            Fjalëkalimi<span className="required-mark"> *</span>
                        </label>
                        <div className="password-wrapper">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="new-password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword((previous) => !previous)}
                            >
                                {showPassword ? 'Fshih' : 'Shfaq'}
                            </button>
                        </div>
                        <small className="field-hint">
                            Të paktën 6 karaktere, me shkronjë të madhe, numër dhe simbol.
                        </small>
                    </div>
                </div>

                {role === 'Courier' && (
                    <>
                        <h2>Të dhënat e korrierit</h2>
                        <div className="form-grid">
                            <KorrieriFields value={korrieri} onChange={setKorrieri} />
                        </div>
                    </>
                )}

                {role === 'Client' && (
                    <>
                        <h2>Të dhënat e klientit</h2>
                        <div className="form-grid">
                            <KlientiFields value={klienti} onChange={setKlienti} />
                        </div>
                    </>
                )}

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
                        {saving ? 'Duke krijuar...' : 'Krijo përdoruesin'}
                    </button>
                </div>
            </form>
        </>
    )
}

export default UserCreatePage
