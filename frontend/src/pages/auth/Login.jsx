import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useLanguage } from '../../context/LanguageContext';
import useAuth from '../../hooks/useAuth';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { login, loading: authLoading } = useAuth();

  // We use loading primarily to disable the button on click now
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setError('');
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Immediate visual feedback on button click
    setLoading(true);

    const result = await login(formData.username, formData.password);

    // Stop loading state for the button
    setLoading(false);

    if (result.success) {
      // REMOVED SETTIMEOUT - Instant navigation for speed
      const targetPath = result.user.role === 'ADMIN' ? '/admin' : from;
      navigate(targetPath, { replace: true });
    } else {
      setError('Invalid username or password');
    }
  };

  // Combined loading state for the button (disables it)
  const isLoading = loading || authLoading;

  // --- SPLIT LAYOUT: Left (Image) + Right (Blue Login) ---
  return (
    <div className="min-h-screen w-full flex font-sans relative">
      
      {/* --- BOTTOM RIGHT LOGO (Text-based, Blue and Yellow) --- */}
      <div className="absolute bottom-4 right-4 lg:bottom-8 lg:right-8 z-10 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-gray-100 select-none">
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-gray-500 tracking-wide font-medium uppercase">
            powered by
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[#0e5ca8] font-extrabold text-lg tracking-tight">
              AERATECH
            </span>
            <span className="text-yellow-500 font-extrabold text-lg tracking-tight">
              HOUSE
            </span>
          </div>
        </div>
      </div>

      {/* --- LEFT SIDE: Image & Text --- */}
      <div className="hidden lg:flex w-[60%] bg-white flex-col justify-center items-center p-12 relative">
        <div className="max-w-lg text-center">
          {/* Heading Text */}
          <h2 className="text-2xl md:text-3xl font-medium text-[#0e5ca8] mb-8 leading-snug">
            Almost there, Enter your<br />credentials to have access.
          </h2>
          
          {/* The Illustration Image */}
          <img 
            src="https://img.freepik.com/free-vector/mobile-login-concept-illustration_114360-83.jpg?w=1380&t=st=1690000000~exp=1690000600~hmac=abcdef" 
            alt="Login Illustration"
            className="w-full h-auto max-h-[500px] object-contain drop-shadow-sm"
          />
        </div>
      </div>

      {/* --- RIGHT SIDE: BLUE BACKGROUND --- */}
      <div className="w-full lg:w-[40%] bg-[#0e5ca8] flex items-center justify-center p-6 lg:p-12 relative">
        
        {/* Language Switcher - Positioned top right */}
        <div className="absolute top-6 right-6 lg:right-10">
          <LanguageSwitcher />
        </div>

        {/* Login Container - White background card */}
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 lg:p-10 transform transition-all duration-300">
          
          {/* Logo / Brand (Now blue text on white background) */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#0e5ca8] tracking-tight">
              AERA<span className="text-yellow-500">LTD</span>
            </h1>
            <p className="text-gray-400 text-xs mt-2 font-medium tracking-wider uppercase">
              {t('common.login')}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Username Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t('common.username')}
              </label>
              <div className="relative group">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0e5ca8] transition-colors" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0e5ca8] focus:bg-white focus:border-transparent transition-all placeholder-gray-400"
                  placeholder="Enter your username"
                  required
                  autoFocus
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {t('common.password')}
              </label>
              <div className="relative group">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0e5ca8] transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all placeholder-gray-400 ${
                    error ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-[#0e5ca8] focus:border-transparent'
                  }`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0e5ca8] focus:outline-none transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                  <span className="text-lg leading-none">•</span> {error}
                </div>
              )}
            </div>

            {/* Submit Button - Changed to Blue with White Text */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#0e5ca8] hover:bg-[#0b4790] text-white py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg hover:shadow-[#0e5ca8]/30 transform hover:-translate-y-0.5 transition duration-200 cursor-pointer ${
                isLoading ? 'opacity-70 cursor-not-allowed transform-none' : ''
              }`}
            >
              {isLoading ? 'Logging in...' : t('common.login')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;