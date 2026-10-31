import { Link } from 'react-router-dom'
import { apiRequest, formatDate, type Klienti } from '../../api'
import { useApi } from '../../hooks/useApi'
import { useFlashMessage } from '../../hooks/useFlashMessage'

function KlientetPage() {
    const { data: klientet, loading, error, reload } = useApi<Klienti[]>('/api/admin/klientet')
    const [message, setMessage] = useFlashMessage()

    async function handleDelete(klienti: Klienti) {
        if (
            !window.confirm(
                `Fshi klientin ${klienti.emriIKompanise}? Do të fshihet edhe llogaria e tij (${klienti.email}).`
            )
        ) {
            return
        }

        const result = await apiRequest(`/api/admin/klientet/${klienti.klientiID}`, 'DELETE')
        setMessage(result.ok ? `Klienti ${klienti.emriIKompanise} u fshi.` : result.message)
        await reload()
    }

    return (
        <>
            <div className="dashboard-title">
                <div>
                    <h1>Klientët</h1>
                    <p className="subtitle-left">Kompanitë klientë dhe personat përgjegjës.</p>
                </div>
                <Link to="/admin/users/new?role=Client" className="button-primary">
                    + Shto klient
                </Link>
            </div>

            {(message || error) && (
                <p className="login-message" role="status">
                    {message || error}
                </p>
            )}

            <section className="panel">
                {loading && <p className="muted">Duke ngarkuar...</p>}

                {!loading && !klientet?.length && <p className="muted">Nuk ka klientë.</p>}

                {!loading && klientet && klientet.length > 0 && (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Kompania</th>
                                <th>Personi përgjegjës</th>
                                <th>Email</th>
                                <th>Adresa</th>
                                <th>Qyteti</th>
                                <th>Telefoni</th>
                                <th>NUI</th>
                                <th>Krijuar</th>
                                <th>Veprime</th>
                            </tr>
                        </thead>
                        <tbody>
                            {klientet.map((klienti) => (
                                <tr key={klienti.klientiID}>
                                    <td data-label="ID">{klienti.klientiID}</td>
                                    <td className="cell-main">{klienti.emriIKompanise}</td>
                                    <td data-label="Personi përgjegjës">{klienti.personiPergjegjes}</td>
                                    <td data-label="Email">{klienti.email}</td>
                                    <td data-label="Adresa">{klienti.adresa}</td>
                                    <td data-label="Qyteti">{klienti.qyteti ?? '–'}</td>
                                    <td data-label="Telefoni">{klienti.numriTelefonit ?? '–'}</td>
                                    <td data-label="NUI">{klienti.nui ?? '–'}</td>
                                    <td data-label="Krijuar">{formatDate(klienti.dataEKrijimit)}</td>
                                    <td>
                                        <div className="row-actions">
                                            <Link
                                                to={`/admin/klientet/${klienti.klientiID}`}
                                                className="button-secondary"
                                            >
                                                Edito
                                            </Link>
                                            <button
                                                type="button"
                                                className="button-danger"
                                                onClick={() => handleDelete(klienti)}
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

export default KlientetPage
