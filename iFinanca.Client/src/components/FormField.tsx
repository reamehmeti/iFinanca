type FormFieldProps = {
    id: string
    label: string
    value: string
    onChange: (value: string) => void
    type?: string
    required?: boolean
    maxLength?: number
    autoComplete?: string
    placeholder?: string
}

function FormField({
    id,
    label,
    value,
    onChange,
    type = 'text',
    required = false,
    maxLength,
    autoComplete,
    placeholder,
}: FormFieldProps) {
    return (
        <div className="form-field">
            <label htmlFor={id}>
                {label}
                {required && <span className="required-mark"> *</span>}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                required={required}
                maxLength={maxLength}
                autoComplete={autoComplete}
                placeholder={placeholder}
            />
        </div>
    )
}

export default FormField
