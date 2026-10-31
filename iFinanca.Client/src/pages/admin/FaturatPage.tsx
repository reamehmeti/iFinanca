import { Link } from 'react-router-dom'
import FaturatList from '../../components/FaturatList'

function FaturatPage() {
    return (
        <>
            <div className="dashboard-title">
                <div>
                    <h1>Faturat</h1>
                    <p className="subtitle-left">Të gjitha faturat, klientët dhe korrierët e tyre.</p>
                </div>
                <Link to="/admin/faturat/new" className="button-primary">
                    + Krijo faturë
                </Link>
            </div>

            <FaturatList admin />
        </>
    )
}

export default FaturatPage
