const PIECES = Array.from({ length: 24 }, (_, index) => index);

/**
 * Короткий праздник за пройденную тему. Только CSS и без библиотек, поэтому не
 * нагружает слабые устройства. При запрете анимаций в системе не показывается.
 */
export function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {PIECES.map((index) => (
        <span
          key={index}
          style={{
            left: `${(index * 41) % 100}%`,
            animationDelay: `${(index % 6) * 70}ms`,
          }}
        />
      ))}
    </div>
  );
}
