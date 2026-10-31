import { Link } from 'react-router-dom'
import { apiRequest, ROLE_LABELS, type UserSummary } from '../../api'
import { useAuth } from '../../auth/authContext'
import { useApi } from '../../hooks/useApi'
import { useFlashMessage } from '../../hooks/useFlashMessage'

function UsersPage() {
    const { user: currentUser } = useAuth()
    const { data: users, loading, error, reload } = useApi<UserSummary[]>('/api/admin/users')
    const [message, setMessage] = useFlashMessage()

    async function handleDelete(user: UserSummary) {
        if (!window.confirm(`A je i sigurt që dëshiron të fshish ${user.email}?`)) {
            return
        }

        const result = await apiRequest(`/api/admin/users/${user.id}`, 'DELETE')
        setMessage(result.ok ? `Përdoruesi ${user.email} u fshi.` : result.message)
        await reload()
    }

    return (
        <>
            <div className="dashboard-title">
                <div>
                    <h1>Përdoruesit</h1>
                    <p className="subtitle-left">Të gjitha llogaritë që mund të hyjnë në iFinanca.</p>
                </div>
                <Link to="/admin/users/new" className="button-primary">
                    + Shto përdorues
                </Link>
            </div>

            {(message || error) && (
                <p className="login-message" role="status">
                    {message || error}
                </p>
            )}

            <section className="panel">
                {loading && <p className="muted">Duke ngarkuar...</p>}

                {!loading && !users?.length && <p className="muted">Nuk ka përdorues.</p>}

                {!loading && users && users.length > 0 && (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Emri / Kompania</th>
                                <th>Roli</th>
                                <th>Veprime</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className="cell-main">{user.email}</td>
                                    <td>{user.name ?? '–'}</td>
                                    <td>
                                        {user.role ? (
                                            <span className="role-badge">{ROLE_LABELS[user.role]}</span>
                                        ) : (
                                            'Pa rol'
                                        )}
                                    </td>
                                    <td>
                                        <div className="row-actions">
                                            <Link to={`/admin/users/${user.id}`} className="button-secondary">
                                                Edito
                                            </Link>
                                            {user.id !== currentUser?.id && (
                                                <button
                                                    type="button"
                                                    className="button-danger"
                                                    onClick={() => handleDelete(user)}
                                                >
                                                    Fshij
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </>
    )
}

export default UsersPage
