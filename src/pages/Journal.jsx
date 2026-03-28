import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import CalendarGrid from '../components/Calendar/CalendarGrid';
import DateModal from '../components/DateModal/DateModal';
import FrameCutter from '../components/FrameCutter/FrameCutter';
import { JournalAPI } from '../api/journalService';

const Journal = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [entries, setEntries] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const loadEntries = useCallback(async () => {
    if (!user) return;
    try {
      const monthEntries = await JournalAPI.getEntriesByMonth(
        user.uid,
        currentDate.getFullYear(),
        currentDate.getMonth()
      );
      setEntries(monthEntries);
    } catch (err) {
      console.error('Failed to load entries:', err);
    }
  }, [user, currentDate]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const fileInputRef = useRef(null);

  const handleDateClick = (dateKey) => {
    setSelectedDate(dateKey);
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setEditEntry({
        dateKey: selectedDate,
        imageUrl: event.target.result,
        tags: [],
        mood: '',
        notes: ''
      });
      setShowEditor(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleMonthChange = (delta) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + delta);
      return d;
    });
  };

  const handleMonthSelect = (targetMonth) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(targetMonth);
      return d;
    });
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedDate(null);
  };

  const handleUploadComplete = () => {
    loadEntries();
    setShowModal(false);
  };

  const handleEditClick = (entry) => {
    setEditEntry(entry);
    setShowEditor(true);
  };

  const handleEditorClose = () => {
    setShowEditor(false);
    setEditEntry(null);
  };

  const handleDeleteDate = async (dateKey) => {
    if (!dateKey) return;

    console.log('🗑️ [Firestore] Attempting to delete entry:', { userId: user.uid, dateKey });

    try {
      await JournalAPI.deleteEntry(user.uid, dateKey);
      console.log('✅ [Firestore] Deletion successful for:', dateKey);
      loadEntries();
    } catch (err) {
      console.error('❌ [Firestore] Delete failed:', err);
      alert('Delete failed: ' + err.message);
    }
  };

  const handleCropComplete = () => {
    loadEntries();
    setShowEditor(false);
    setEditEntry(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-cream)' }}>
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 border-3 border-rose rounded-full animate-spin mx-auto mb-4"
            style={{ borderTopColor: 'transparent' }} />
          <p style={{ color: 'var(--color-ink-light)' }}>Loading your journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative overflow-hidden flex flex-col animate-fade-in" style={{ backgroundColor: 'var(--color-cream)' }}>
      {/* Subtle paper grain overlay */}
      <div className="fixed inset-0 opacity-[0.4] mix-blend-multiply pointer-events-none z-0"
        style={{ backgroundSize: '150px', backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      {/* Modern Floating Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[1200px] animate-fade-in-up">
        <div className="flex items-center justify-between px-8 py-4 rounded-full border border-[var(--color-border)] shadow-sm bg-white/60 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <h1 className="text-xl sm:text-2xl font-normal tracking-tight" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-ink)' }}>
              Livre de Souvenirs
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--color-cream-dark)] bg-opacity-30 border border-[var(--color-border)]">
              {user?.photoURL && (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-7 h-7 rounded-full shadow-sm"
                  referrerPolicy="no-referrer"
                />
              )}
              <span className="text-[11px] font-bold opacity-80 uppercase tracking-[0.2em]" style={{ color: 'var(--color-ink)' }}>
                {user?.displayName?.split(' ')[0]}
              </span>
            </div>

            <button
              onClick={logout}
              className="btn-aesthetic"
            >
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full h-full relative z-10 flex flex-col p-4 sm:p-6 lg:p-8 pt-20 overflow-hidden">
        {/* Top Spacer to clear the navbar */}
        <div className="h-20 w-full flex-shrink-0" />

        <div className="flex-1 w-full overflow-hidden">
          <CalendarGrid
            currentDate={currentDate}
            entries={entries}
            onDateClick={handleDateClick}
            onMonthChange={handleMonthChange}
            onMonthSelect={handleMonthSelect}
            onDeleteDate={handleDeleteDate}
            onEditClick={handleEditClick}
          />
        </div>
      </main>

      {/* Hidden File Input for direct uploads */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Frame Cutter Editor */}
      {showEditor && editEntry && (
        <FrameCutter
          entry={editEntry}
          userId={user.uid}
          onClose={handleEditorClose}
          onSave={handleCropComplete}
        />
      )}
    </div>
  );
};

export default Journal;
