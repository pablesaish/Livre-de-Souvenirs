const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const CalendarHeader = ({ currentDate, onMonthChange, isJapanese, onToggleLanguage }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
      <div className="flex items-center gap-3">
        {/* Prev month */}
        <button
          id="prev-month-btn"
          onClick={() => onMonthChange(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer"
          style={{
            background: 'rgba(255,255,255,0.6)',
            border: '1.5px solid var(--color-soft-pink)',
            color: 'var(--color-ink-light)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-blush)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.6)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Month / Year */}
        <h2 className="text-2xl sm:text-3xl font-bold min-w-[220px] text-center"
          style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-ink)' }}>
          {MONTHS[month]} <span style={{ color: 'var(--color-rose)', fontWeight: 400 }}>{year}</span>
        </h2>

        {/* Next month */}
        <button
          id="next-month-btn"
          onClick={() => onMonthChange(1)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer"
          style={{
            background: 'rgba(255,255,255,0.6)',
            border: '1.5px solid var(--color-soft-pink)',
            color: 'var(--color-ink-light)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-blush)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.6)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Language Toggle */}
      <button
        id="language-toggle-btn"
        onClick={onToggleLanguage}
        className="text-sm px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer font-medium"
        style={{
          background: isJapanese
            ? 'linear-gradient(135deg, var(--color-rose) 0%, var(--color-rose-dark) 100%)'
            : 'rgba(255,255,255,0.6)',
          color: isJapanese ? 'white' : 'var(--color-ink-light)',
          border: isJapanese ? 'none' : '1.5px solid var(--color-soft-pink)',
          boxShadow: isJapanese ? '0 4px 12px rgba(200, 112, 112, 0.3)' : 'none',
        }}
      >
        {isJapanese ? '🇯🇵 日本語' : '🇬🇧 English'}
      </button>
    </div>
  );
};

export default CalendarHeader;
