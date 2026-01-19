import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { alumni_logo } from '../assets/images';

type FormData = {
  email: string;
  password: string;
  userType: string;
};

type FormErrors = {
  email?: string;
  password?: string;
  userType?: string;
};

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    userType: ''
  });

  const [errors, setErrors] = useState<FormErrors>({
    email: '',
    password: '',
    userType: ''
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const field = name as keyof FormData;

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    if (!formData.userType) {
      newErrors.userType = 'Please select a user type';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      console.log('Login form submitted:', formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8 bg-gradient-to-br from-blue-50 to-blue-400">
      <div className="flex w-full max-w-3xl bg-white rounded-xl shadow-xl overflow-hidden">
        
        {/* Left side - Logo/Illustration */}
        <div className="hidden md:flex md:w-1/2 bg-blue-50 items-center justify-center p-6">
          <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-md">
            <img 
              src={alumni_logo} 
              alt="AlumniConnect Logo" 
              className="w-36 h-36 rounded-full object-cover"
            />
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
              Login to AlumniConnect
            </h2>
            
            {/* User Type Dropdown */}
            <div className="space-y-1">
              <div className="relative">
                <select
                  name="userType"
                  value={formData.userType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-blue-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none text-sm"
                >
                  <option value="" disabled>Select User Type</option>
                  <option value="student">Student</option>
                  <option value="alumni">Alumni</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
              {errors.userType && (
                <p className="text-red-500 text-xs font-medium ml-2">{errors.userType}</p>
              )}
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-blue-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
              {errors.email && (
                <p className="text-red-500 text-xs font-medium ml-2">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-blue-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
              {errors.password && (
                <p className="text-red-500 text-xs font-medium ml-2">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-gray-600 hover:text-blue-700 text-xs transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 shadow-sm text-sm"
            >
              LOGIN
            </button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-gray-500 text-xs">
                  Don't have an account?
                </span>
              </div>
            </div>

            {/* Sign Up Links */}
            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => navigate('/signup/student')}
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm block w-full"
              >
                Sign up as Student
              </button>
              <button
                type="button"
                onClick={() => navigate('/signup/alumni')}
                className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors text-sm block w-full"
              >
                Sign up as Alumni
              </button>
            </div>
          </form>

          {/* Back to Home Link */}
          <div className="mt-6 text-center">
            <Link 
              to="/" 
              className="text-gray-500 hover:text-gray-700 text-xs transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;