import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useEffect } from 'react';

const Login = () => {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate('/journal');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor: 'var(--color-cream)',
        backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(201, 169, 110, 0.05) 0%, transparent 70%), linear-gradient(180deg, var(--color-paper) 0%, var(--color-cream) 100%)',
      }}
    >
      {/* Subtle paper grain overlay */}
      <div className="absolute inset-0 opacity-[0.4] mix-blend-multiply pointer-events-none" 
           style={{ backgroundSize: '150px', backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

      {/* Login Card */}
      <div className="p-10 sm:p-14 max-w-md w-full mx-4 text-center animate-fade-in-up relative z-10 flex flex-col items-center">
        {/* Logo / Brand */}
        <div className="mb-12">
          <h1 className="text-5xl font-normal mb-3 tracking-wide"
            style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-ink)' }}>
            Pixel Diary
          </h1>
          <p className="text-sm tracking-widest uppercase opacity-70"
            style={{ color: 'var(--color-ink-light)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
            Your memories, beautifully curated.
          </p>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-4 mb-10 w-32 mx-auto">
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-gold)' }} />
          <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
        </div>

        {/* Google Sign-In Button */}
        <button
          id="google-sign-in-btn"
          onClick={login}
          disabled={loading}
          className="w-[280px] flex items-center justify-center gap-3 py-3.5 px-6 rounded-full font-medium text-sm transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-white"
          style={{
            border: '1px solid var(--color-border)',
            color: 'var(--color-ink)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
            fontFamily: 'var(--font-body)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.06)';
            e.currentTarget.style.borderColor = 'var(--color-gold)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.03)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
          }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-[var(--color-gold)] rounded-full animate-spin"
              style={{ borderTopColor: 'transparent' }} />
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Login;
