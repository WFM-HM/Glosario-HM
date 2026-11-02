type SwitchProps = {
    textOn: string
    textOff: string
    value: boolean
    onChange: () => void
}

function SwitchComponent({
    textOn,
    textOff,
    value,
    onChange
}: SwitchProps) {
    return (
        <label className="toggle-switch">
            <input
                type="checkbox"
                className="toggle-switch-checkbox"
                checked={value}
                onChange={onChange}
                aria-label={value ? textOn : textOff}
            />
            <span className="toggle-switch-label">
                <span className="toggle-switch-inner" />
                <span className="toggle-switch-switch" />
            </span>
            <span className="toggle-switch-text">{value ? textOn : textOff}</span>
        </label>
    )
}

export default SwitchComponent