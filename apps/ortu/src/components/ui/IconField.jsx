import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Input dengan ikon di kiri. `reveal` menambah tombol lihat/sembunyikan (untuk kata sandi),
// `multiline` merender textarea. Sisa props diteruskan ke <input>/<textarea>.
export default function IconField({
  label, required, icon: Icon, reveal = false, multiline = false, error, className = '', variant = '', ...rest
}) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  const controlProps = { id, 'aria-invalid': Boolean(error), ...rest };
  if (!multiline) controlProps.type = reveal ? (visible ? 'text' : 'password') : rest.type ?? 'text';

  return (
    <div className={`auth-field ${className}`}>
      <label htmlFor={id}>{label}{required && <b> *</b>}</label>
      <div className={`auth-input ${variant} ${multiline ? 'multi' : ''} ${error ? 'invalid' : ''}`}>
        {Icon && <Icon size={14} />}
        {multiline ? <textarea rows={2} {...controlProps} /> : <input {...controlProps} />}
        {reveal && (
          <button type="button" className="auth-eye" onClick={() => setVisible((v) => !v)} aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>
            {visible ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && <small className="auth-error" role="alert">{error}</small>}
    </div>
  );
}
