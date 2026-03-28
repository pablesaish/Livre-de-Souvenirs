import { useState } from 'react';
import DateCell from './DateCell';

const DAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_JP = ['日', '月', '火', '水', '木', '金', '土'];

const CalendarGrid = ({ currentDate, entries, onDateClick, onMonthChange, onMonthSelect, onDeleteDate, onEditClick }) => {
  const [isJapanese, setIsJapanese] = useState(false);
  const [previewDateKey, setPreviewDateKey] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeMobilePage, setActiveMobilePage] = useState('calendar'); // 'calendar' or 'preview'

  const daysLabels = isJapanese ? DAYS_JP : DAYS_EN;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calculate calendar grid
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Build cells (linear array of 42 cells)
  const cells = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, currentMonth: false, dateKey: null });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, currentMonth: true, dateKey });
  }

  // Next month leading days
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, currentMonth: false, dateKey: null });
  }

  const monthNumberStr = String(month + 1).padStart(2, '0');

  // Grid header + date cells
  const gridItems = [];
  daysLabels.forEach((label, i) => {
    gridItems.push(
      <div
        key={`header-${i}`}
        className="border-b border-r py-3 text-center text-[10px] sm:text-[13px] font-medium uppercase tracking-widest"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)' }}
      >
        {label}
      </div>
    );
  });

  cells.forEach((cell, i) => {
    gridItems.push(
      <DateCell
        key={`cell-${cell.dateKey || i}`}
        day={cell.day}
        dateKey={cell.dateKey}
        isCurrentMonth={cell.currentMonth}
        isToday={
          cell.currentMonth &&
          cell.day === new Date().getDate() &&
          month === new Date().getMonth() &&
          year === new Date().getFullYear()
        }
        entry={cell.dateKey ? entries[cell.dateKey] : null}
        onClick={() => {
          if (!cell.currentMonth || !cell.dateKey) return;
          if (entries[cell.dateKey]) {
            setPreviewDateKey(cell.dateKey);
          } else {
            onDateClick(cell.dateKey);
          }
        }}
        onEditClick={onEditClick}
      />
    );
  });

  // Entry Navigation Logic
  const sortedEntryKeys = Object.keys(entries);
  const latestDateKey = sortedEntryKeys[sortedEntryKeys.length - 1];
  const activePreviewKey = (previewDateKey && entries[previewDateKey]) ? previewDateKey : latestDateKey;
  const featuredEntry = activePreviewKey ? entries[activePreviewKey] : null;

  const handlePrevDay = () => {
    const currentIndex = sortedEntryKeys.indexOf(activePreviewKey);
    if (currentIndex > 0) setPreviewDateKey(sortedEntryKeys[currentIndex - 1]);
  };

  const handleNextDay = () => {
    const currentIndex = sortedEntryKeys.indexOf(activePreviewKey);
    if (currentIndex < sortedEntryKeys.length - 1) setPreviewDateKey(sortedEntryKeys[currentIndex + 1]);
  };

  // ✅ FIX: custom delete flow — no window.confirm (was silently returning false)
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await onDeleteDate(activePreviewKey);
      setPreviewDateKey(null); // ✅ reset so deleted entry disappears from preview
    } catch (err) {
      console.error('❌ Delete failed:', err);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="animate-fade-in-up w-full h-full relative flex flex-col">

      {/* Month Navigation Arrows (Desktop) */}
      <button
        onClick={() => onMonthChange(-1)}
        className="absolute -left-12 lg:-left-16 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-[var(--color-ink-light)] hover:text-[var(--color-gold)] transition-all cursor-pointer rounded-full z-20 opacity-30 hover:opacity-100 hidden xl:flex hover:scale-110 active:scale-95"
      >
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" className="w-6 h-6 lg:w-8 lg:h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button
        onClick={() => onMonthChange(1)}
        className="absolute -right-12 lg:-right-16 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-[var(--color-ink-light)] hover:text-[var(--color-gold)] transition-all cursor-pointer rounded-full z-20 opacity-30 hover:opacity-100 hidden xl:flex hover:scale-110 active:scale-95"
      >
        <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.2" stroke="currentColor" className="w-6 h-6 lg:w-8 lg:h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Book Container */}
      <div
        className="w-full h-full relative shadow-[0_4px_60px_rgba(0,0,0,0.06)] overflow-hidden rounded-2xl flex"
        style={{ background: 'var(--color-paper)' }}
      >
        {/* The Center Spine Shadow (Desktop Only) */}
        <div
          className="absolute left-[60%] top-0 bottom-0 z-30 w-[100px] -translate-x-1/2 pointer-events-none opacity-40 mix-blend-multiply hidden md:block"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(139,94,60,0.02) 40%, rgba(139,94,60,0.06) 49%, rgba(139,94,60,0.1) 50%, rgba(139,94,60,0.02) 53%, transparent 100%)'
          }}
        />

        {/* LEFT PAGE — Calendar Grid */}
        <div
          className={`w-full md:w-[60%] h-full flex flex-col p-6 lg:p-12 relative z-10 ${activeMobilePage === 'calendar' ? 'flex' : 'hidden md:flex'}`}
          style={{ borderRight: '1px solid var(--color-border)' }}
        >
          <div className="flex justify-between items-end mb-10 w-full px-1">
            <div className="flex items-baseline gap-6 lg:gap-10">
              <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((mName, idx) => (
                  <button
                    key={mName}
                    onClick={() => onMonthSelect(idx)}
                    className={`text-[10px] lg:text-[11px] uppercase tracking-[0.25em] transition-all cursor-pointer ${idx === month ? 'font-bold opacity-100 border-b-2 border-[var(--color-gold)] pb-1' : 'opacity-30 hover:opacity-100 hover:text-[var(--color-gold)]'}`}
                    style={{ color: idx === month ? 'var(--color-ink)' : 'inherit', fontFamily: 'var(--font-body)' }}
                  >
                    {mName}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div
            className="flex-1 w-full grid grid-cols-7 grid-rows-[auto_repeat(6,1fr)] bg-transparent border-t border-l"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {gridItems}
          </div>
        </div>

        {/* RIGHT PAGE — Preview */}
        <div className={`w-full md:w-[40%] h-full flex-col p-6 lg:p-10 relative z-10 bg-[var(--color-cream-dark)] bg-opacity-10 ${activeMobilePage === 'preview' ? 'flex' : 'hidden md:flex'}`}>
          <div className="flex justify-end items-center gap-8 mb-12 w-full h-[60px] px-2">
            <button
              onClick={() => setIsJapanese(!isJapanese)}
              className="text-[11px] font-bold tracking-[0.3em] text-[var(--color-ink)] opacity-40 hover:opacity-100 transition-opacity cursor-pointer uppercase"
            >
              {isJapanese ? 'JP' : 'EN'}
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-4 relative">

            {/* Prev / Next entry arrows */}
            {featuredEntry && (
              <>
                <button
                  onClick={handlePrevDay}
                  disabled={sortedEntryKeys.indexOf(activePreviewKey) === 0}
                  className="absolute left-0 top-1/2 -translate-y-1/2 p-4 text-[var(--color-ink)] opacity-20 hover:opacity-100 disabled:opacity-5 transition-opacity cursor-pointer z-40"
                >
                  <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  onClick={handleNextDay}
                  disabled={sortedEntryKeys.indexOf(activePreviewKey) === sortedEntryKeys.length - 1}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-[var(--color-ink)] opacity-20 hover:opacity-100 disabled:opacity-5 transition-opacity cursor-pointer z-40"
                >
                  <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </>
            )}

            {featuredEntry ? (
              <div className="relative group animate-fade-in transform rotate-2 hover:rotate-0 transition-all duration-700 bg-white p-6 pb-20 shadow-[0_20px_80px_rgba(0,0,0,0.1)] max-w-md w-full">

                {/* ✅ Trash Button */}
                <button
                  onClick={handleDelete}
                  className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-rose-500 hover:text-rose-700 hover:scale-110 transition-all z-50 cursor-pointer border border-rose-100"
                  title="Delete Photo"
                >
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>

                {/* ✅ Custom Delete Confirm Overlay */}
                {showDeleteConfirm && (
                  <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm rounded-sm">
                    <p
                      className="text-sm font-medium mb-6 text-center px-6 leading-relaxed"
                      style={{ color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}
                    >
                      Delete photo for<br />
                      <span className="font-bold">{activePreviewKey?.replace(/-/g, '.')}</span>?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={cancelDelete}
                        className="px-5 py-2 text-[11px] tracking-[0.2em] uppercase border rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-ink)', fontFamily: 'var(--font-body)' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmDelete}
                        className="px-5 py-2 text-[11px] tracking-[0.2em] uppercase bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors cursor-pointer"
                        style={{ fontFamily: 'var(--font-body)' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                <img
                  src={featuredEntry.thumbnailUrl || featuredEntry.imageUrl}
                  alt="Featured Entry"
                  className="w-full h-auto object-contain max-h-[60vh] bg-[var(--color-cream-dark)]"
                />
                <p
                  className="absolute bottom-8 left-0 w-full px-6 text-center text-base lg:text-lg italic tracking-wider opacity-90"
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}
                >
                  {featuredEntry.caption || activePreviewKey.replace(/-/g, '.')}
                </p>
                <div className="absolute top-6 -right-6 w-16 h-6 bg-yellow-100/40 opacity-40 mix-blend-multiply rotate-45 pointer-events-none" />
              </div>
            ) : (
              <div className="text-center opacity-30">
                <div className="w-40 h-40 border-2 border-dashed border-[var(--color-ink-light)] rounded-full flex items-center justify-center mx-auto mb-10">
                  <span className="text-4xl font-light">+</span>
                </div>
                <p
                  className="text-sm tracking-[0.4em] uppercase"
                  style={{ fontFamily: 'var(--font-body)', color: 'var(--color-ink)' }}
                >
                  No memories yet
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Page Toggle - FAB */}
      <div className="fixed bottom-10 right-10 z-50 md:hidden flex flex-col gap-4">
        <button
          onClick={() => setActiveMobilePage(activeMobilePage === 'calendar' ? 'preview' : 'calendar')}
          className="btn-aesthetic !w-16 !h-16 !p-0 shadow-xl border-2 border-[var(--color-gold)] bg-white"
        >
          <span className="flex items-center justify-center">
            {activeMobilePage === 'calendar' ? (
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            ) : (
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            )}
          </span>
        </button>
      </div>

      {/* Month Navigation Arrows (Mobile) */}
      <div className="flex justify-center gap-10 mt-6 md:hidden">
        <button
          onClick={() => onMonthChange(-1)}
          className="text-[var(--color-ink-light)] opacity-40 hover:opacity-100 transition-all p-2 uppercase text-[10px] tracking-widest font-bold"
        >
          Prev
        </button>
        <button
          onClick={() => onMonthChange(1)}
          className="text-[var(--color-ink-light)] opacity-40 hover:opacity-100 transition-all p-2 uppercase text-[10px] tracking-widest font-bold"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CalendarGrid;