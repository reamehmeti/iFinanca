import { useAuth } from '../auth/authContext'
import AppHeader from '../components/AppHeader'
import FaturatList from '../components/FaturatList'

function HomePage() {
    const { user } = useAuth()

    return (
        <div className="app-shell">
            <AppHeader />

            <main className="dashboard">
                <div className="dashboard-title">
                    <div>
                        <h1>Faturat e mia</h1>
                        <p className="subtitle-left">
                            {user?.role === 'Courier'
                                ? 'Faturat që duhet t’i dorëzosh. Kliko hapin e radhës kur e nis dhe kur e dorëzon.'
                                : 'Faturat e kompanisë suaj. Konfirmo pranimin kur e merr dhe pagesën kur paguan.'}
                        </p>
                    </div>
                </div>

                <FaturatList />
            </main>
        </div>
    )
}

export default HomePage
