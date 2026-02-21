import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, Shield, ArrowLeft, CheckCircle } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  onResetPassword: (email: string) => Promise<{ error: { message: string } | null }>;
}

export default function LoginPage({ onLogin, onResetPassword }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [resetSent, setResetSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (mode === 'reset') {
      if (!email.trim()) {
        setError('Please enter your email address');
        return;
      }
      setLoading(true);
      const { error: resetError } = await onResetPassword(email.trim());
      setLoading(false);
      if (resetError) {
        setError('Unable to send reset email. Please try again.');
      } else {
        setResetSent(true);
      }
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    const { error: authError } = await onLogin(email.trim(), password);
    setLoading(false);
    if (authError) {
      setError('Invalid email or password');
    }
  }

  function switchToReset() {
    setMode('reset');
    setError('');
    setResetSent(false);
  }

  function switchToLogin() {
    setMode('login');
    setError('');
    setResetSent(false);
  }

  return (
    <main className="flex-1 flex items-center justify-center px-5 sm:px-4 py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-navy-800 mb-4">
            <Shield className="w-7 h-7 text-brand-400" />
          </div>
          <h1 className="text-2xl font-bold text-navy-900">
            {mode === 'login' ? 'Admin Login' : 'Reset Password'}
          </h1>
          <p className="text-navy-500 text-sm mt-2">
            {mode === 'login'
              ? 'Sign in to access integration settings'
              : 'Enter your email to receive a password reset link'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-navy-100 p-6 sm:p-8 space-y-5 animate-fade-in-up"
          style={{ animationDelay: '80ms', animationFillMode: 'both' }}
        >
          {resetSent ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success-100 mb-4">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
              <h2 className="text-lg font-semibold text-navy-900 mb-2">Check Your Email</h2>
              <p className="text-sm text-navy-500 leading-relaxed">
                If an account exists for <span className="font-medium text-navy-700">{email}</span>, you'll receive a password reset link shortly.
              </p>
              <button
                type="button"
                onClick={switchToLogin}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-navy-600 hover:text-navy-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="admin@example.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-navy-200 rounded-lg text-navy-900 placeholder:text-navy-300 hover:border-navy-300 focus:border-navy-600 focus:ring-1 focus:ring-navy-200 transition-colors text-sm"
                  />
                </div>
              </div>

              {mode === 'login' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-navy-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={switchToReset}
                      className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-11 py-3 bg-white border border-navy-200 rounded-lg text-navy-900 placeholder:text-navy-300 hover:border-navy-300 focus:border-navy-600 focus:ring-1 focus:ring-navy-200 transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-navy-400 hover:text-navy-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-error-50 border border-error-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-error-500 flex-shrink-0" />
                  <p className="text-sm text-error-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-navy-800 rounded-lg hover:bg-navy-900 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === 'login' ? 'Signing in...' : 'Sending...'}
                  </>
                ) : mode === 'login' ? (
                  'Sign In'
                ) : (
                  'Send Reset Link'
                )}
              </button>

              {mode === 'reset' && (
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-navy-500 hover:text-navy-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </button>
              )}
            </>
          )}
        </form>

        <p
          className="text-center text-xs text-navy-400 mt-6 animate-fade-in-up"
          style={{ animationDelay: '160ms', animationFillMode: 'both' }}
        >
          This area is restricted to authorized administrators only.
        </p>
      </div>
    </main>
  );
}
