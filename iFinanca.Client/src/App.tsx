import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { homePathFor } from './api'
import RequireAuth from './auth/RequireAuth'
import { useAuth } from './auth/authContext'
import AdminLayout from './components/AdminLayout'
import AppFooter from './components/AppFooter'
import DashboardPage from './pages/admin/DashboardPage'
import FaturaEditPage from './pages/admin/FaturaEditPage'
import FaturatPage from './pages/admin/FaturatPage'
import KlientetPage from './pages/admin/KlientetPage'
import KlientiEditPage from './pages/admin/KlientiEditPage'
import KorrieratPage from './pages/admin/KorrieratPage'
import KorrieriEditPage from './pages/admin/KorrieriEditPage'
import UserCreatePage from './pages/admin/UserCreatePage'
import UserEditPage from './pages/admin/UserEditPage'
import UsersPage from './pages/admin/UsersPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'

function App() {
    return (
        <>
            <div className="app-content">
                <AppRoutes />
            </div>
            <AppFooter />
        </>
    )
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/admin"
                element={
                    <RequireAuth roles={['Admin']}>
                        <AdminLayout />
                    </RequireAuth>
                }
            >
                <Route index element={<DashboardPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="users/new" element={<UserCreatePage />} />
                <Route path="users/:id" element={<UserEditPage />} />
                <Route path="korrierat" element={<KorrieratPage />} />
                <Route path="korrierat/:id" element={<KorrieriEditPage />} />
                <Route path="klientet" element={<KlientetPage />} />
                <Route path="klientet/:id" element={<KlientiEditPage />} />
                <Route path="faturat" element={<FaturatPage />} />
                <Route path="faturat/:id" element={<FaturaEditPage />} />
            </Route>
            <Route
                path="/home"
                element={
                    <RequireAuth roles={['Courier', 'Client']}>
                        <HomePage />
                    </RequireAuth>
                }
            />
            <Route
                path="/account/password"
                element={
                    <RequireAuth roles={['Courier', 'Client']}>
                        <ChangePasswordPage />
                    </RequireAuth>
                }
            />
            <Route path="*" element={<DefaultRedirect />} />
        </Routes>
    )
}

function DefaultRedirect() {
    const { user, loading } = useAuth()

    if (loading) {
        return <p className="page-loading">Duke ngarkuar...</p>
    }

    return <Navigate to={user ? homePathFor(user.role) : '/login'} replace />
}

export default App
