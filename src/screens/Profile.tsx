import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, LogOut, HelpCircle, Phone, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import { rideApi } from '../services/rides';
import Layout from '../components/Layout';

export default function Profile() {
  const { navigateTo, userName, userRole, logout, updateProfile, user } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyName1: '',
    emergencyPhone1: '',
    emergencyName2: '',
    emergencyPhone2: '',
    emergencyName3: '',
    emergencyPhone3: '',
    profilePhoto: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        emergencyName1: user.emergencyName1 || '',
        emergencyPhone1: user.emergencyPhone1 || '',
        emergencyName2: user.emergencyName2 || '',
        emergencyPhone2: user.emergencyPhone2 || '',
        emergencyName3: user.emergencyName3 || '',
        emergencyPhone3: user.emergencyPhone3 || '',
        profilePhoto: user.profilePhoto || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigateTo('landing');
  };

  return (
    <Layout fullWidth>
      <div className="min-h-screen bg-gray-50 p-6">
        <button
          onClick={() => navigateTo('dashboard')}
          className="mb-8 flex items-center text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </button>

        <div className="max-w-2xl mx-auto space-y-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4 group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                  {formData.profilePhoto ? (
                    <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300 uppercase">
                      {userName?.charAt(0)}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="text-white" size={24} />
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="w-full max-w-md mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo URL</label>
                  <input
                    type="text"
                    name="profilePhoto"
                    value={formData.profilePhoto}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-black focus:ring-black transition-colors"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
              ) : null}

              <h1 className="text-2xl font-bold text-black">{userName}</h1>
              <p className="text-gray-500 capitalize">{userRole}</p>
            </div>

            {message && (
              <div className={`p-4 rounded-xl mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-black transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-black transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="text-red-500" size={20} />
                  <h2 className="text-lg font-semibold">Emergency Contacts</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact 1 Name</label>
                    <input
                      type="text"
                      name="emergencyName1"
                      value={formData.emergencyName1}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-black transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact 1 Phone</label>
                    <input
                      type="tel"
                      name="emergencyPhone1"
                      value={formData.emergencyPhone1}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-black transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact 2 Name</label>
                    <input
                      type="text"
                      name="emergencyName2"
                      value={formData.emergencyName2}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-black transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact 2 Phone</label>
                    <input
                      type="tel"
                      name="emergencyPhone2"
                      value={formData.emergencyPhone2}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-black focus:ring-black transition-colors disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                {isEditing ? (
                  <>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                ) : (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </form>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <button className="flex items-center justify-between p-6 bg-white rounded-2xl border border-gray-200 hover:border-black transition-colors group w-full">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-xl group-hover:bg-black group-hover:text-white transition-colors">
                  <HelpCircle size={24} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-black">Help & Support</p>
                  <p className="text-sm text-gray-500">Get assistance with your rides</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
