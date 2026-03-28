import { useMemo } from 'react';

const DateCell = ({ day, dateKey, isCurrentMonth, isToday, entry, onClick, onEditClick }) => {
  
  // Consistent random rotation between -2.5deg and +2.5deg based on the date
  const rotation = useMemo(() => {
    if (!dateKey) return 0;
    // Simple hash to get pseudo-random but consistent number
    const hash = String(dateKey).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return -2.5 + (hash % 50) / 10;
  }, [dateKey]);

  if (!isCurrentMonth) {
    return (
      <div className="border-b border-r p-2 flex items-start text-[11px] font-normal italic opacity-20"
           style={{ borderColor: 'var(--color-border)', fontFamily: 'var(--font-heading)', color: 'var(--color-ink-light)' }}>
        {day}
      </div>
    );
  }

  const hasEntry = entry && entry.imageUrl;

  return (
    <div
      onClick={onClick}
      className={`border-b border-r relative cursor-pointer group flex items-center justify-center min-h-[110px] transition-all duration-500 hover:bg-[var(--color-cream-dark)] hover:bg-opacity-20`}
      style={{ borderColor: 'var(--color-border)' }}
    >
      {/* Day number (top-left) */}
      <div className="absolute top-2 left-3 text-[14px] font-normal italic z-10 transition-colors duration-500"
           style={{ 
             fontFamily: 'var(--font-heading)', 
             color: isToday ? 'var(--color-gold)' : 'var(--color-ink-light)',
             opacity: isToday ? 1 : 0.6
           }}>
        {day}
      </div>

      {hasEntry && (
        <div className="relative w-[80%] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] group-hover:shadow-[0_12px_40px_rgba(201,169,110,0.1)] group-hover:scale-[1.05] transition-all duration-700 ease-out"
             style={{ 
               transform: `rotate(${rotation}deg) translateY(4px)`,
               padding: '6px 6px 24px 6px',
               border: '1px solid rgba(0,0,0,0.02)'
             }}>
          <img
            src={entry.thumbnailUrl || entry.imageUrl}
            alt={`Entry for ${dateKey}`}
            className="w-full aspect-[4/5] object-cover bg-[var(--color-cream-dark)] bg-opacity-10"
          />
          <div className="absolute bottom-2 left-0 w-full text-center text-[10px] tracking-[0.1em] font-medium"
               style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-body)', opacity: 0.6 }}>
            {entry.caption || entry.dateKey.replace(/-/g, '.')}
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditClick(entry);
            }}
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-10 cursor-pointer bg-white shadow-xl text-[var(--color-ink-light)] hover:text-[var(--color-gold)] scale-75 group-hover:scale-100 border border-[var(--color-border)]"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.147l-2.84 1.42 1.42-2.84a4.5 4.5 0 011.147-1.89l12.193-12.192z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L16.875 4.5" /></svg>
          </button>
        </div>
      )}

      {/* Add indicator on hover for empty cell */}
      {!hasEntry && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700">
          <div className="w-8 h-8 rounded-full border border-[var(--color-gold)] border-dashed flex items-center justify-center">
            <span className="text-xl font-light text-[var(--color-gold)]">+</span>
          </div>
        </div>
      )}

      {/* Minimal indicator for today if empty */}
      {isToday && !hasEntry && (
         <div className="absolute top-[32px] left-[18px] w-1 h-1 rounded-full animate-float" style={{ background: 'var(--color-gold)' }} />
      )}
    </div>
  );
};

export default DateCell;
