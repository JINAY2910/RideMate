import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, User as UserIcon, Star, Shield } from 'lucide-react';
import { EmergencyContact, useApp } from '../context/AppContext';
import Button from '../components/Button';
import Input from '../components/Input';

export default function Profile() {
  const { navigateTo, userName, setUserName, userRole, emergencyContacts, setEmergencyContacts } = useApp();
  const [name, setName] = useState(userName);
  const [gender, setGender] = useState('male');
  const initialContacts = useMemo(() => {
    if (emergencyContacts.length >= 3) {
      return emergencyContacts.slice(0, 3);
    }
    const placeholders: EmergencyContact[] = Array.from({ length: 3 - emergencyContacts.length }, () => ({
      name: '',
      phone: '',
    }));
    return [...emergencyContacts, ...placeholders];
  }, [emergencyContacts]);
  const [contacts, setContacts] = useState<EmergencyContact[]>(initialContacts);

  useEffect(() => {
    setContacts(initialContacts);
  }, [initialContacts]);

  const handleContactChange = (index: number, field: keyof EmergencyContact, value: string) => {
    setContacts((prev) =>
      prev.map((contact, i) => (i === index ? { ...contact, [field]: value } : contact))
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUserName(name);
    const normalizedContacts = contacts.map((contact) => ({
      name: contact.name.trim(),
      phone: contact.phone.trim(),
    }));
    setEmergencyContacts(normalizedContacts);
    navigateTo('dashboard');
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
          <Input
            label="Full Name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="mb-1">
            <label className="block text-sm font-semibold mb-2.5 text-black">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg smooth-transition focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-white"
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
                      required
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="e.g., +1 (555) 123-4567"
                      value={contact.phone}
                      onChange={(e) => handleContactChange(index, 'phone', e.target.value)}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <Button type="submit" fullWidth size="lg">
              Save Changes
            </Button>
            <Button type="button" variant="secondary" size="lg" onClick={() => navigateTo('dashboard')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
