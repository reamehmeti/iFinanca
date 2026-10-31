import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest, homePathFor } from '../api'
import { useAuth } from '../auth/authContext'

function ChangePasswordPage() {
    const { user } = useAuth()
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setMessage('')

        if (newPassword !== confirmPassword) {
            setMessage('Fjalëkalimet e reja nuk përputhen.')
            return
        }

        setLoading(true)

        const result = await apiRequest('/api/account/change-password', 'POST', {
            currentPassword,
            newPassword,
        })

        if (result.ok) {
            setMessage('Fjalëkalimi u ndryshua me sukses.')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } else {
            setMessage(result.message)
        }

        setLoading(false)
    }

    return (
        <main className="login-page">
            <section className="login-card">
                <div className="brand-icon">i</div>
                <h1>Ndrysho fjalëkalimin</h1>
                <p className="subtitle">{user?.email}</p>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="current-password">Fjalëkalimi aktual</label>
                    <input
                        id="current-password"
                        type="password"
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        required
                    />

                    <label htmlFor="new-password">Fjalëkalimi i ri</label>
                    <input
                        id="new-password"
                        type="password"
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        required
                    />

                    <label htmlFor="confirm-password">Përsërit fjalëkalimin e ri</label>
                    <input
                        id="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? 'Duke ruajtur...' : 'Ruaj fjalëkalimin'}
                    </button>
                </form>

                {message && (
                    <p className="login-message" role="status">
                        {message}
                    </p>
                )}

                <p className="footer-text">
                    <Link to={homePathFor(user?.role ?? null)}>← Kthehu</Link>
                </p>
            </section>
        </main>
    )
}

export default ChangePasswordPage
