import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { homePathFor } from '../api'
import { useAuth } from '../auth/authContext'

function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { user, refresh } = useAuth()

    if (user) {
        return <Navigate to={homePathFor(user.role)} replace />
    }

    async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setMessage('')
        setLoading(true)

        try {
            const response = await fetch('/api/auth/login?useCookies=true', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            })

            if (response.ok) {
                const current = await refresh()
                navigate(homePathFor(current?.role ?? null), { replace: true })
            } else if (response.status === 401) {
                setMessage('Email adresë ose fjalëkalim i gabuar.')
            } else {
                setMessage(`Identifikimi dështoi. Statusi: ${response.status}`)
            }
        } catch {
            setMessage('Nuk mund të lidhemi me serverin.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="login-page">
            <section className="login-card">
                <div className="brand-icon">i</div>
                <h1>iFinanca</h1>
                <p className="subtitle">Mirë se erdhe sërish. Identifikohu për të vazhduar.</p>

                <form onSubmit={handleLogin}>
                    <label htmlFor="email">Email adresa</label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="username"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />

                    <label htmlFor="password">Fjalëkalimi</label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Vendosni fjalëkalimin..."
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? 'Duke hyrë...' : 'Hyr'}
                    </button>
                </form>

                {message && (
                    <p className="login-message" role="status">
                        {message}
                    </p>
                )}

                <p className="footer-text">
                    Llogaritë krijohen nga administratori. Qasje e sigurt në financat tuaja.
                </p>
            </section>
        </main>
    )
}

export default LoginPage
