import { Link } from 'react-router-dom'
import { apiRequest, formatDate, type Korrieri } from '../../api'
import { useApi } from '../../hooks/useApi'
import { useFlashMessage } from '../../hooks/useFlashMessage'

function KorrieratPage() {
    const { data: korrierat, loading, error, reload } = useApi<Korrieri[]>('/api/admin/korrierat')
    const [message, setMessage] = useFlashMessage()

    async function handleDelete(korrieri: Korrieri) {
        const name = `${korrieri.emri} ${korrieri.mbiemri}`

        if (!window.confirm(`Fshi korrierin ${name}? Do të fshihet edhe llogaria e tij (${korrieri.email}).`)) {
            return
        }

        const result = await apiRequest(`/api/admin/korrierat/${korrieri.korrieriID}`, 'DELETE')
        setMessage(result.ok ? `Korrieri ${name} u fshi.` : result.message)
        await reload()
    }

    return (
        <>
            <div className="dashboard-title">
                <div>
                    <h1>Korrierët</h1>
                    <p className="subtitle-left">Korrierët dhe postat ku punojnë.</p>
                </div>
                <Link to="/admin/users/new?role=Courier" className="button-primary">
                    + Shto korrier
                </Link>
            </div>

            {(message || error) && (
                <p className="login-message" role="status">
                    {message || error}
                </p>
            )}

            <section className="panel">
                {loading && <p className="muted">Duke ngarkuar...</p>}

                {!loading && !korrierat?.length && <p className="muted">Nuk ka korrierë.</p>}

                {!loading && korrierat && korrierat.length > 0 && (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Emri dhe mbiemri</th>
                                <th>Email</th>
                                <th>Telefoni</th>
                                <th>Posta</th>
                                <th>Qyteti</th>
                                <th>Targa</th>
                                <th>Statusi</th>
                                <th>Krijuar</th>
                                <th>Veprime</th>
                            </tr>
                        </thead>
                        <tbody>
                            {korrierat.map((korrieri) => (
                                <tr key={korrieri.korrieriID}>
                                    <td data-label="ID">{korrieri.korrieriID}</td>
                                    <td className="cell-main">
                                        {korrieri.emri} {korrieri.mbiemri}
                                    </td>
                                    <td data-label="Email">{korrieri.email}</td>
                                    <td data-label="Telefoni">{korrieri.numriTelefonit}</td>
                                    <td data-label="Posta">{korrieri.posta}</td>
                                    <td data-label="Qyteti">{korrieri.qyteti ?? '–'}</td>
                                    <td data-label="Targa">{korrieri.targaEAutomjetit ?? '–'}</td>
                                    <td data-label="Statusi">
                                        <span className={korrieri.aktiv ? 'status-badge active' : 'status-badge'}>
                                            {korrieri.aktiv ? 'Aktiv' : 'Joaktiv'}
                                        </span>
                                    </td>
                                    <td data-label="Krijuar">{formatDate(korrieri.dataEKrijimit)}</td>
                                    <td>
                                        <div className="row-actions">
                                            <Link
                                                to={`/admin/korrierat/${korrieri.korrieriID}`}
                                                className="button-secondary"
                                            >
                                                Edito
                                            </Link>
                                            <button
                                                type="button"
                                                className="button-danger"
                                                onClick={() => handleDelete(korrieri)}
                                            >
                                                Fshij
                                            </button>
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

export default KorrieratPage
