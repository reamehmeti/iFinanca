import type { KorrieriForm } from '../api'
import FormField from './FormField'

type KorrieriFieldsProps = {
    value: KorrieriForm
    onChange: (value: KorrieriForm) => void
}

function KorrieriFields({ value, onChange }: KorrieriFieldsProps) {
    return (
        <>
            <FormField
                id="korrieri-emri"
                label="Emri"
                value={value.emri}
                onChange={(emri) => onChange({ ...value, emri })}
                required
                maxLength={100}
            />
            <FormField
                id="korrieri-mbiemri"
                label="Mbiemri"
                value={value.mbiemri}
                onChange={(mbiemri) => onChange({ ...value, mbiemri })}
                required
                maxLength={100}
            />
            <FormField
                id="korrieri-numriTelefonit"
                label="Numri i telefonit"
                value={value.numriTelefonit}
                onChange={(numriTelefonit) => onChange({ ...value, numriTelefonit })}
                required
                maxLength={30}
            />
            <FormField
                id="korrieri-posta"
                label="Posta"
                value={value.posta}
                onChange={(posta) => onChange({ ...value, posta })}
                required
                maxLength={100}
            />
            <FormField
                id="korrieri-qyteti"
                label="Qyteti"
                value={value.qyteti}
                onChange={(qyteti) => onChange({ ...value, qyteti })}
                maxLength={100}
            />
            <FormField
                id="korrieri-targaEAutomjetit"
                label="Targa e automjetit"
                value={value.targaEAutomjetit}
                onChange={(targaEAutomjetit) => onChange({ ...value, targaEAutomjetit })}
                maxLength={20}
            />

            <label className="checkbox-field">
                <input
                    type="checkbox"
                    checked={value.aktiv}
                    onChange={(event) => onChange({ ...value, aktiv: event.target.checked })}
                />
                Korrier aktiv
            </label>
        </>
    )
}

export default KorrieriFields
