import type { KlientiForm } from '../api'
import FormField from './FormField'

type KlientiFieldsProps = {
    value: KlientiForm
    onChange: (value: KlientiForm) => void
}

function KlientiFields({ value, onChange }: KlientiFieldsProps) {
    return (
        <>
            <FormField
                id="klienti-emriIKompanise"
                label="Emri i kompanisë"
                value={value.emriIKompanise}
                onChange={(emriIKompanise) => onChange({ ...value, emriIKompanise })}
                required
                maxLength={200}
            />
            <FormField
                id="klienti-personiPergjegjes"
                label="Personi përgjegjës"
                value={value.personiPergjegjes}
                onChange={(personiPergjegjes) => onChange({ ...value, personiPergjegjes })}
                required
                maxLength={150}
            />
            <FormField
                id="klienti-adresa"
                label="Adresa"
                value={value.adresa}
                onChange={(adresa) => onChange({ ...value, adresa })}
                required
                maxLength={250}
            />
            <FormField
                id="klienti-qyteti"
                label="Qyteti"
                value={value.qyteti}
                onChange={(qyteti) => onChange({ ...value, qyteti })}
                maxLength={100}
            />
            <FormField
                id="klienti-numriTelefonit"
                label="Numri i telefonit"
                value={value.numriTelefonit}
                onChange={(numriTelefonit) => onChange({ ...value, numriTelefonit })}
                maxLength={30}
            />
            <FormField
                id="klienti-nui"
                label="NUI"
                value={value.nui}
                onChange={(nui) => onChange({ ...value, nui })}
                maxLength={20}
            />
        </>
    )
}

export default KlientiFields
