import { Link } from 'react-router-dom'
import { faturaNumber, formatDate, formatMoney, type Fatura, type Role, type UserSummary } from '../../api'
import StatusBadge from '../../components/StatusBadge'
import { useApi } from '../../hooks/useApi'

const RECENT_COUNT = 5

function DashboardPage() {
    const { data: users, error } = useApi<UserSummary[]>('/api/admin/users')
    const { data: faturat } = useApi<Fatura[]>('/api/faturat')

    const recentFaturat = faturat ? faturat.slice(0, RECENT_COUNT) : []

    let unpaidTotal = 0
    for (const fatura of faturat ?? []) {
        if (fatura.statusi !== 'EPaguar') {
            unpaidTotal += fatura.cmimi
        }
    }

    function countUsers(role?: Role) {
        if (!users) {
            return '–'
        }

        if (!role) {
            return users.length
        }

        return users.filter((user) => user.role === role).length
    }

    return (
        <>
            <div className="dashboard-title">
                <div>
                    <h1>Paneli i administratorit</h1>
                    <p className="subtitle-left">Menaxho përdoruesit, korrierët, klientët dhe faturat.</p>
                </div>
                <div className="row-actions">
                    <Link to="/admin/users/new" className="button-secondary">
                        + Shto përdorues
                    </Link>
                    <Link to="/admin/faturat/new" className="button-primary">
                        + Krijo faturë
                    </Link>
                </div>
            </div>

            {error && (
                <p className="login-message" role="status">
                    {error}
                </p>
            )}

            <section className="stats">
                <Link to="/admin/users" className="stat-card">
                    <span>Përdorues gjithsej</span>
                    <strong>{countUsers()}</strong>
                </Link>
                <Link to="/admin/users" className="stat-card">
                    <span>Administratorë</span>
                    <strong>{countUsers('Admin')}</strong>
                </Link>
                <Link to="/admin/korrierat" className="stat-card">
                    <span>Korrierë</span>
                    <strong>{countUsers('Courier')}</strong>
                </Link>
                <Link to="/admin/klientet" className="stat-card">
                    <span>Klientë</span>
                    <strong>{countUsers('Client')}</strong>
                </Link>
                <Link to="/admin/faturat" className="stat-card">
                    <span>Fatura gjithsej</span>
                    <strong>{faturat ? faturat.length : '–'}</strong>
                </Link>
                <Link to="/admin/faturat" className="stat-card">
                    <span>Të papaguara</span>
                    <strong>{faturat ? formatMoney(unpaidTotal) : '–'}</strong>
                </Link>
            </section>

            <section className="panel recent-panel">
                <div className="panel-header">
                    <h2>Faturat e fundit</h2>
                    <Link to="/admin/faturat" className="panel-link">
                        Shiko të gjitha →
                    </Link>
                </div>

                {!faturat && <p className="muted">Duke ngarkuar...</p>}

                {faturat && recentFaturat.length === 0 && <p className="muted">Nuk ka fatura ende.</p>}

                {recentFaturat.length > 0 && (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nr.</th>
                                <th>Klienti</th>
                                <th>Korrieri</th>
                                <th className="cell-number">Çmimi</th>
                                <th>Statusi</th>
                                <th>Data</th>
                                <th>Veprime</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentFaturat.map((fatura) => (
                                <tr key={fatura.faturaID}>
                                    <td className="cell-main">{faturaNumber(fatura.faturaID)}</td>
                                    <td data-label="Klienti">{fatura.emriIKompanise}</td>
                                    <td data-label="Korrieri">{fatura.korrieriEmri}</td>
                                    <td data-label="Çmimi" className="cell-number">
                                        {formatMoney(fatura.cmimi)}
                                    </td>
                                    <td>
                                        <StatusBadge statusi={fatura.statusi} />
                                    </td>
                                    <td data-label="Data">{formatDate(fatura.dataEKrijimit)}</td>
                                    <td>
                                        <div className="row-actions">
                                            <a
                                                href={`/api/faturat/${fatura.faturaID}/pdf`}
                                                className="button-secondary"
                                                download
                                            >
                                                PDF
                                            </a>
                                            <Link
                                                to={`/admin/faturat/${fatura.faturaID}`}
                                                className="button-secondary"
                                            >
                                                Hap
                                            </Link>
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

export default DashboardPage
