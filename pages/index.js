import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ServicesGrid from '../components/ServicesGrid';
import urlData from '../data/www_links_20250213_143022.json';

export default function Home() {
  const [data, setData] = useState(urlData);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (showLoginModal) {
      const savedEmail = localStorage.getItem('rememberedEmail');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, [showLoginModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        localStorage.setItem('user', JSON.stringify(data.user));
        router.replace('/dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar onLoginClick={() => setShowLoginModal(true)} />

      <main>
        <div className="container mx-auto px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-6xl font-bold leading-tight">
                <span className="block text-gray-900">GROW</span>
                <span className="block text-blue-600">YOUR</span>
                <span className="block text-emerald-500">TOPICS</span>
              </h1>
              <p className="text-gray-600 text-lg max-w-md">
                Create, manage, and organize your topics efficiently with our powerful platform.
              </p>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>

        <ServicesGrid />

        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6">URL Redirect Manager</h1>
          
          {data.map((pageData, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 pb-4 border-b border-gray-200">
                {pageData.page_url}
              </h2>
              
              <div className="mt-4 space-y-4">
                {pageData.links.map((link, linkIndex) => {
                  const needsUpdate = link.url !== link.final_url;
                  
                  return (
                    <div 
                      key={linkIndex}
                      className={`p-4 rounded-lg ${needsUpdate ? 'bg-red-50 border-l-4 border-red-500' : 'bg-green-50 border-l-4 border-green-500'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-grow">
                          <div className="mb-2">
                            <span className="font-medium">Original URL: </span>
                            <span className="text-gray-700">{link.url}</span>
                          </div>
                          <div className="mb-2">
                            <span className="font-medium">Final URL: </span>
                            <span className="text-gray-700">{link.final_url}</span>
                          </div>
                          <div>
                            <span className="font-medium">Anchor Text: </span>
                            <span className="italic text-gray-600">{link.anchor_text}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          needsUpdate 
                            ? 'bg-red-500 text-white' 
                            : 'bg-green-500 text-white'
                        }`}>
                          {needsUpdate ? 'Needs Update' : 'Updated'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />

      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full relative">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-6">Login to Your Account</h3>
            
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                  </label>
                  
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                    Forgot password?
                  </a>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

