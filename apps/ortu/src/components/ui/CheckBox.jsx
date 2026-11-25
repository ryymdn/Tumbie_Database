// Kotak persetujuan bergaya desain (latar krem). `children` = teks label.
export default function CheckBox({ checked, onChange, error, children }) {
  return (
    <div>
      <label className={`auth-check ${error ? 'invalid' : ''}`}>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <i />
        <span>{children}</span>
      </label>
      {error && <small className="auth-error" role="alert">{error}</small>}
    </div>
  );
}
