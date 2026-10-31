import { NavLink, Outlet } from 'react-router-dom'
import AppHeader from './AppHeader'

const links = [
    { to: '/admin', label: 'Paneli', end: true },
    { to: '/admin/users', label: 'Përdoruesit', end: false },
    { to: '/admin/korrierat', label: 'Korrierët', end: false },
    { to: '/admin/klientet', label: 'Klientët', end: false },
    { to: '/admin/faturat', label: 'Faturat', end: false },
]

function AdminLayout() {
    return (
        <div className="app-shell">
            <AppHeader />

            <nav className="admin-nav" aria-label="Menyja e administratorit">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        className={({ isActive }) => (isActive ? 'admin-nav-link active' : 'admin-nav-link')}
                    >
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <main className="dashboard">
                <Outlet />
            </main>
        </div>
    )
}

export default AdminLayout
