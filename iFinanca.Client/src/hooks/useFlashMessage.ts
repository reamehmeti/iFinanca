import { useState } from 'react'
import { useLocation } from 'react-router-dom'

export function useFlashMessage() {
    const location = useLocation()
    const state = location.state as { message?: string } | null
    return useState(state?.message ?? '')
}
