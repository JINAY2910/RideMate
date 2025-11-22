import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, User as UserIcon, Star, Shield } from 'lucide-react';
import { EmergencyContact, useApp } from '../context/AppContext';
import Button from '../components/Button';
import Input from '../components/Input';
import { authApi } from '../services/auth';

export default function Profile() {
  const { navigateTo, userName, setUserName, userRole, authToken, setEmergencyContacts } = useApp();
  const [name, setName] = useState(userName);
  const [gender, setGender] = useState('male');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    { name: '', phone: '' },
    { name: '', phone: '' },
    { name: '', phone: '' },
  ]);

  // Fetch user data including emergency contacts on mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!authToken) return;
      
      try {
        const response = await authApi.getMe(authToken);
        const user = response.user;
        
        setName(user.name);
        
        // Load emergency contacts from database
        const dbContacts: EmergencyContact[] = [
          { 
            name: user.emergencyName1 || '', 
            phone: user.emergencyPhone1 || '' 
          },
          { 
            name: user.emergencyName2 || '', 
            phone: user.emergencyPhone2 || '' 
          },
          { 
            name: user.emergencyName3 || '', 
            phone: user.emergencyPhone3 || '' 
          },
        ];
        
        setContacts(dbContacts);
        setEmergencyContacts(dbContacts.filter(c => c.name && c.phone));
      } catch (err) {
        console.error('Error fetching user data:', err);
        // Don't show error on initial load, just use defaults
      }
    };

    fetchUserData();
  }, [authToken, setEmergencyContacts]);

  const handleContactChange = (index: number, field: keyof EmergencyContact, value: string) => {
    setContacts((prev) =>
      prev.map((contact, i) => (i === index ? { ...contact, [field]: value } : contact))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!authToken) {
      setError('You must be logged in to update your profile');
      setLoading(false);
      return;
    }

    try {
      const normalizedContacts = contacts.map((contact) => ({
        name: contact.name.trim(),
        phone: contact.phone.trim(),
      }));

      // Update profile in database
      const response = await authApi.updateProfile(authToken, {
        name: name.trim(),
        emergencyName1: normalizedContacts[0].name,
        emergencyPhone1: normalizedContacts[0].phone,
        emergencyName2: normalizedContacts[1].name,
        emergencyPhone2: normalizedContacts[1].phone,
        emergencyName3: normalizedContacts[2].name,
        emergencyPhone3: normalizedContacts[2].phone,
      });

      // Update local state
      setUserName(response.user.name);
      setEmergencyContacts(normalizedContacts.filter(c => c.name && c.phone));
      
      navigateTo('dashboard');
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gray-100 rounded-full translate-x-1/3 -translate-y-1/3 opacity-20"></div>

      <button
        onClick={() => navigateTo('dashboard')}
        className="mb-8 flex items-center text-black hover:opacity-70 transition-opacity font-semibold"
      >
        <ArrowLeft size={24} className="mr-2" />
        Back to Dashboard
      </button>

      <div className="max-w-md mx-auto relative z-10 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black">Your Profile</h1>
          <p className="text-gray-600 font-medium mt-2">Manage your account settings</p>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="w-40 h-40 bg-gradient-to-br from-black to-gray-800 border-4 border-black rounded-full flex items-center justify-center mb-6 shadow-lg">
            <UserIcon size={80} className="text-white" strokeWidth={1} />
          </div>
          <Button variant="secondary" size="sm">
            Change Photo
          </Button>
        </div>

        <div className="mb-8 p-6 bg-gradient-to-br from-gray-100 to-gray-50 border-2 border-black rounded-xl text-center">
          <p className="text-sm text-gray-600 font-semibold uppercase mb-3">Community Rating</p>
          <div className="flex items-center justify-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} size={24} className="text-black fill-black" />
            ))}
          </div>
          <p className="text-3xl font-bold text-black">4.8</p>
          <p className="text-xs text-gray-600 mt-2">Based on 47 rides</p>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {error && (
            <div className="rounded-lg border-2 border-red-500 bg-red-50 p-4 text-red-700 font-semibold text-sm">
              {error}
            </div>
          )}

          <Input
            label="Full Name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />

          <div className="mb-1">
            <label className="block text-sm font-semibold mb-2.5 text-black">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg smooth-transition focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
              disabled={loading}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="p-5 bg-gray-50 border-2 border-black rounded-xl mt-6">
            <p className="text-xs text-gray-600 font-semibold uppercase mb-2">Account Role</p>
            <p className="text-2xl font-bold text-black capitalize">{userRole}</p>
          </div>

          <div className="p-5 bg-white border-2 border-black rounded-xl mt-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={24} className="text-black" />
              <div>
                <p className="text-xs text-gray-600 font-semibold uppercase">Safety</p>
                <h3 className="text-xl font-bold text-black">Emergency Contacts</h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Add up to three trusted contacts who will receive real-time alerts whenever you trigger SOS.
            </p>
            <div className="space-y-5">
              {contacts.map((contact, index) => (
                <div key={`contact-${index}`} className="rounded-2xl border-2 border-gray-200 p-4">
                  <p className="text-sm font-semibold text-gray-500 uppercase mb-3">
                    Contact {index + 1}
                  </p>
                  <div className="space-y-4">
                    <Input
                      label="Full Name"
                      placeholder="e.g., Priya Verma"
                      value={contact.name}
                      onChange={(e) => handleContactChange(index, 'name', e.target.value)}
                      disabled={loading}
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="e.g., +1 (555) 123-4567"
                      value={contact.phone}
                      onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              size="lg" 
              onClick={() => navigateTo('dashboard')}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
