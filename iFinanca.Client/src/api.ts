export type Role = 'Admin' | 'Courier' | 'Client'

export const ROLES: Role[] = ['Admin', 'Courier', 'Client']

export const ROLE_LABELS: Record<Role, string> = {
    Admin: 'Administrator',
    Courier: 'Korrier',
    Client: 'Klient',
}

export type CurrentUser = {
    id: string
    email: string
    role: Role | null
}

export type UserSummary = {
    id: string
    email: string
    role: Role | null
    name: string | null
    korrieriID: number | null
    klientiID: number | null
}

export type KorrieriForm = {
    emri: string
    mbiemri: string
    numriTelefonit: string
    posta: string
    qyteti: string
    targaEAutomjetit: string
    aktiv: boolean
}

export type Korrieri = KorrieriForm & {
    korrieriID: number
    userId: string
    email: string
    qyteti: string | null
    targaEAutomjetit: string | null
    dataEKrijimit: string
}

export type KlientiForm = {
    emriIKompanise: string
    personiPergjegjes: string
    adresa: string
    qyteti: string
    numriTelefonit: string
    nui: string
}

export type Klienti = KlientiForm & {
    klientiID: number
    userId: string
    email: string
    qyteti: string | null
    numriTelefonit: string | null
    nui: string | null
    dataEKrijimit: string
}

export type Statusi = 'EKrijuar' | 'GatiPerDorezim' | 'NeDorezim' | 'EPranuar' | 'EPaguar'

export const STATUSET: Statusi[] = ['EKrijuar', 'GatiPerDorezim', 'NeDorezim', 'EPranuar', 'EPaguar']

export const STATUS_LABELS: Record<Statusi, string> = {
    EKrijuar: 'E krijuar',
    GatiPerDorezim: 'Gati për dorëzim',
    NeDorezim: 'Në dorëzim',
    EPranuar: 'E pranuar',
    EPaguar: 'E paguar',
}

export type FaturaForm = {
    klientiID: number
    korrieriID: number
    pershkrimi: string
    cmimi: string
    statusi: Statusi
}

export type Fatura = {
    faturaID: number
    klientiID: number
    emriIKompanise: string
    personiPergjegjes: string
    adresa: string
    klientiQyteti: string | null
    klientiTelefoni: string | null
    nui: string | null
    klientiEmail: string | null
    korrieriID: number
    korrieriEmri: string
    korrieriTelefoni: string
    posta: string
    targaEAutomjetit: string | null
    pershkrimi: string
    cmimi: number
    statusi: Statusi
    dataEKrijimit: string
    dataEPerditesimit: string
    statuseTeLejuara: Statusi[]
}

export const NEXT_STEP_LABELS: Record<Statusi, string> = {
    EKrijuar: 'Kthe në "E krijuar"',
    GatiPerDorezim: 'Gati për dorëzim',
    NeDorezim: 'Nis dorëzimin',
    EPranuar: 'Konfirmo pranimin',
    EPaguar: 'Shëno si të paguar',
}

export function nextStepLabel(statusi: Statusi, role: Role | null) {
    if (statusi === 'EPranuar' && role === 'Courier') {
        return 'Shëno të dorëzuar'
    }

    return NEXT_STEP_LABELS[statusi]
}

// Hapi i radhës i faturës, ose null kur përdoruesi nuk ka asnjë veprim për të.
export function nextStep(fatura: Fatura): Statusi | null {
    const currentIndex = STATUSET.indexOf(fatura.statusi)
    const next = STATUSET[currentIndex + 1]

    if (next && fatura.statuseTeLejuara.includes(next)) {
        return next
    }

    return null
}

export const emptyKorrieri: KorrieriForm = {
    emri: '',
    mbiemri: '',
    numriTelefonit: '',
    posta: '',
    qyteti: '',
    targaEAutomjetit: '',
    aktiv: true,
}

export const emptyKlienti: KlientiForm = {
    emriIKompanise: '',
    personiPergjegjes: '',
    adresa: '',
    qyteti: '',
    numriTelefonit: '',
    nui: '',
}

export type ApiResult<T> = {
    ok: boolean
    status: number
    data: T | null
    message: string
}

type ErrorBody = {
    message?: string
    title?: string
    errors?: string[] | Record<string, string[]>
}

export async function apiRequest<T>(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    body?: unknown
): Promise<ApiResult<T>> {
    try {
        const response = await fetch(url, {
            method,
            headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: body === undefined ? undefined : JSON.stringify(body),
        })

        const data = await response.json().catch(() => null)

        return {
            ok: response.ok,
            status: response.status,
            data: response.ok ? (data as T) : null,
            message: response.ok ? data?.message ?? '' : errorMessage(response.status, data),
        }
    } catch {
        return {
            ok: false,
            status: 0,
            data: null,
            message: 'Nuk mund të lidhemi me serverin.',
        }
    }
}

function errorMessage(status: number, data: ErrorBody | null) {
    if (status === 401) {
        return 'Sesioni ka përfunduar. Identifikohu përsëri.'
    }

    if (status === 403) {
        return 'Nuk ke autorizim për këtë veprim.'
    }

    if (status === 404 && !data?.message) {
        return 'Nuk u gjet.'
    }

    const mainMessage = data?.message ?? data?.title ?? `Gabim: ${status}`

    let errors: string[] = []

    if (Array.isArray(data?.errors)) {
        errors = data.errors
    } else if (data?.errors) {
        errors = Object.values(data.errors).flat()
    }

    if (errors.length === 0) {
        return mainMessage
    }

    return `${mainMessage} ${errors.join(' ')}`
}

export function homePathFor(role: Role | null) {
    return role === 'Admin' ? '/admin' : '/home'
}

export function formatDate(value: string) {
    const date = new Date(value)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${day}.${month}.${date.getFullYear()}`
}

export function formatMoney(value: number) {
    return `${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
}

export function faturaNumber(faturaID: number) {
    return String(faturaID).padStart(6, '0')
}
