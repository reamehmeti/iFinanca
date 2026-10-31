import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../api'

export function useApi<T>(url: string | null) {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(url !== null)
    const [error, setError] = useState('')

    const reload = useCallback(async () => {
        if (url === null) {
            return
        }

        const result = await apiRequest<T>(url)
        setData(result.data)
        setError(result.ok ? '' : result.message)
        setLoading(false)
    }, [url])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- loads the data when the page opens
        void reload()
    }, [reload])

    return { data, loading, error, reload }
}
