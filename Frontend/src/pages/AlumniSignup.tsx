import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

type FormData = {
  name: string;
  email: string;
  phone: string;
  passoutYear: string;
  department: string;
  marksheet: File | null;
  password: string;
  confirmPassword: string;
};

type FormErrors = {
  name?: string;
  email?: string;
  phone?: string;
  passoutYear?: string;
  department?: string;
  marksheet?: string;
  password?: string;
  confirmPassword?: string;
};

const AlumniSignup: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    passoutYear: '',
    department: '',
    marksheet: null,
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      marksheet: file
    }));

    if (errors.marksheet) {
      setErrors(prev => ({
        ...prev,
        marksheet: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    }

    if (!formData.passoutYear) {
      newErrors.passoutYear = 'Passout year is required';
      isValid = false;
    } else {
      const year = parseInt(formData.passoutYear);
      const currentYear = new Date().getFullYear();
      if (year < 1950 || year > currentYear) {
        newErrors.passoutYear = 'Please enter a valid year';
        isValid = false;
      }
    }

    if (!formData.department) {
      newErrors.department = 'Please select your department';
      isValid = false;
    }

    if (!formData.marksheet) {
      newErrors.marksheet = 'Marksheet is required for verification';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      console.log('Alumni signup form submitted:', formData);

      alert('Alumni signup successful! Verification will be processed.');
      navigate('/login');
    }
  };


  const currentYear = new Date().getFullYear();
  const passoutYears = Array.from({ length: 50 }, (_, i) => {
    const year = currentYear - i;
    return { value: year.toString(), label: year.toString() };
  });

  const departmentOptions = [
    { value: 'computer', label: 'Computer Engineering' },
    { value: 'AIDS', label: 'Artificial Intelligence & Data Science' },
    { value: 'CHEMICAL', label: 'Chemical Engineering' },
    { value: 'EXTC', label: 'Electronics & Telecommunication' },
    { value: 'IT', label: 'Information Technology' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center py-6 px-4 pt-28 bg-[#0A0D14] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none">
        <div className="flex items-center justify-between w-full max-w-5xl bg-[#121620]/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-3 pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <Link to="/" className="flex items-center gap-3 pl-2">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-white/10">
              <img
                src="/logo.png"
                alt="AlumniConnect"
                className="mt-2 block h-full w-full scale-[1.7] origin-center object-contain object-center"
              />
            </div>
            <span className="text-lg font-bold font-syne text-white tracking-tight">AlumniConnect</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-amber-500 px-5 py-2 text-sm font-bold text-[#0A0D14] hover:bg-amber-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              Join Network
            </Link>
          </div>
        </div>
      </header>

      <div className="flex w-full max-w-4xl rounded-xl border border-white/10 bg-[#121620]/85 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md overflow-hidden">
        
        {/* Left side - Logo/Illustration */}
        <div className="hidden md:flex md:w-1/2 bg-white/5 items-center justify-center p-6 border-r border-white/10">
          <div className="w-48 h-48 bg-white/10 rounded-full flex items-center justify-center shadow-md border border-white/20">
            <img 
              src="/logo.png" 
              alt="Alumni Logo" 
              className="w-36 h-36 rounded-full object-cover"
            />
          </div>
          <div className="absolute bottom-6 text-center text-indigo-900">
            <h3 className="text-lg font-bold mb-1 text-white">Alumni Registration</h3>
            <p className="text-xs text-gray-300">Mentor the next generation</p>
          </div>
        </div>

        {/* Right side - Signup Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="text-xl font-bold text-white text-center mb-4">
              Alumni Sign Up
            </h2>
            
            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300 ml-1">Full Name *</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all text-sm text-gray-100 placeholder:text-gray-400"
              />
              {errors.name && (
                <p className="text-red-500 text-xs font-medium ml-1">{errors.name}</p>
              )}
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300 ml-1">Email Address *</label>
              <input
                type="email"
                name="email"
                placeholder="alumni@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all text-sm text-gray-100 placeholder:text-gray-400"
              />
              {errors.email && (
                <p className="text-red-500 text-xs font-medium ml-1">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300 ml-1">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all text-sm text-gray-100 placeholder:text-gray-400"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs font-medium ml-1">{errors.phone}</p>
              )}
            </div>

            {/* Passout Year Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300 ml-1">Passout Year *</label>
              <div className="relative">
                <select
                  name="passoutYear"
                  value={formData.passoutYear}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all appearance-none text-sm text-gray-100"
                >
                  <option value="" disabled>Select passout year</option>
                  {passoutYears.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.passoutYear && (
                <p className="text-red-500 text-xs font-medium ml-1">{errors.passoutYear}</p>
              )}
            </div>

            {/* Department Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300 ml-1">Department *</label>
              <div className="relative">
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all appearance-none text-sm text-gray-100"
                >
                  <option value="" disabled>Select your department</option>
                  {departmentOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.department && (
                <p className="text-red-500 text-xs font-medium ml-1">{errors.department}</p>
              )}
            </div>

            {/* Marksheet Upload */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300 ml-1">Marksheet (for verification) *</label>
              <div className="relative">
                <input
                  type="file"
                  name="marksheet"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all text-sm text-gray-100 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-white/20 file:text-xs file:font-medium file:bg-white/10 file:text-gray-200 hover:file:bg-white/20"
                />
              </div>
              <p className="text-xs text-gray-400 ml-1 mt-0.5">Upload PDF, JPG, or PNG (Max 5MB)</p>
              {formData.marksheet && (
                <p className="text-xs text-green-600 ml-1 mt-0.5">
                  ✓ Selected: {formData.marksheet.name}
                </p>
              )}
              {errors.marksheet && (
                <p className="text-red-500 text-xs font-medium ml-1">{errors.marksheet}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300 ml-1">Password *</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password (min. 6 characters)"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all text-sm text-gray-100 placeholder:text-gray-400"
              />
              {errors.password && (
                <p className="text-red-500 text-xs font-medium ml-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300 ml-1">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-white/5 border border-white/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all text-sm text-gray-100 placeholder:text-gray-400"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs font-medium ml-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                className="h-3 w-3 text-indigo-600 rounded focus:ring-indigo-500"
                required
              />
              <label htmlFor="terms" className="text-xs text-gray-400">
                I agree to the <a href="#" className="text-indigo-600 hover:underline">Terms</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>
              </label>
            </div>

            {/* Mentor Checkbox */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="mentor"
                className="h-3 w-3 text-green-600 rounded focus:ring-green-500"
              />
              <label htmlFor="mentor" className="text-xs text-gray-400">
                I'm interested in mentoring students
              </label>
            </div>

            {/* Sign Up Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-[#111827] font-semibold rounded-lg hover:from-amber-400 hover:to-orange-400 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 shadow-sm text-sm"
              >
                CREATE ALUMNI ACCOUNT
              </button>
            </div>

            {/* Divider */}
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/15"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#121620] px-3 text-gray-400 text-xs">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-amber-400 hover:text-amber-300 font-medium transition-colors text-sm"
              >
                Login to existing account
              </button>
            </div>
          </form>

          {/* Back to Home Link */}
          <div className="mt-4 text-center">
            <Link 
              to="/" 
              className="text-gray-400 hover:text-gray-200 text-xs transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniSignup;
