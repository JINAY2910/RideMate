import { useState } from 'react';
import { ArrowLeft, User, Mail, Lock, Phone, LogOut, Car } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { authApi } from '../services/auth';

export default function Signup() {
  const { navigateTo, setAuthToken, setRole, setUserName, setUserEmail, setUserPhone } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'driver' | 'rider'>('rider');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!name || !email || !phone || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Basic phone validation (at least 10 digits)
    const phoneRegex = /^[\d+\s-()]{10,}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      setError('Please enter a valid phone number (at least 10 digits)');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role: selectedRole,
      });

      // Store auth data
      setAuthToken(response.token);
      setRole(response.user.role);
      setUserName(response.user.name);
      setUserEmail(response.user.email);
      setUserPhone(response.user.phone);

      // Navigate to dashboard
      navigateTo('dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
      
      if (errorMessage.includes('already exists')) {
        setError('An account with this email already exists. Please login instead.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-gray-100 rounded-full -translate-y-1/2 -translate-x-1/3 opacity-20"></div>

      <button
        onClick={() => navigateTo('landing')}
        className="absolute top-6 left-6 p-2 hover:bg-gray-100 rounded-lg transition-all duration-300"
      >
        <ArrowLeft size={24} className="text-black" />
      </button>

      <div className="max-w-md w-full relative z-10 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Join RideMate</h1>
          <p className="text-gray-600 font-medium">Create your account in seconds</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          {error && (
            <div className="rounded-lg border-2 border-red-500 bg-red-50 p-4 text-red-700 font-semibold text-sm">
              {error}
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="Your full name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            icon={<User size={20} />}
            required
            disabled={loading}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            icon={<Mail size={20} />}
            required
            disabled={loading}
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+91 9876543210"
            value={phone}
            onChange={(e) => {
              const value = e.target.value;
              // Allow digits, spaces, +, -, and parentheses
              if (/^[\d+\s-()]*$/.test(value)) {
                setPhone(value);
                setError(null);
              }
            }}
            icon={<Phone size={20} />}
            required
            disabled={loading}
          />
          <Input
            label="Password"
            type="password"
            placeholder="•••••••• (min 6 characters)"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            icon={<Lock size={20} />}
            required
            disabled={loading}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError(null);
            }}
            icon={<Lock size={20} />}
            required
            disabled={loading}
          />

          <div className="pt-2 pb-1">
            <label className="block text-sm font-semibold mb-3 text-black">I'm a</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('rider');
                  setError(null);
                }}
                disabled={loading}
                className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  selectedRole === 'rider'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-300 hover:border-black'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <LogOut size={18} /> Rider
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('driver');
                  setError(null);
                }}
                disabled={loading}
                className={`flex-1 py-3 rounded-lg border-2 font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  selectedRole === 'driver'
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-300 hover:border-black'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Car size={18} /> Driver
              </button>
            </div>
          </div>

          <Button type="submit" fullWidth size="lg" className="mt-6" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigateTo('login')}
              className="font-semibold text-black hover:opacity-70 transition-opacity"
            >
              Sign in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
