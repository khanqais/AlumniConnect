import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { alumni_logo } from '../assets/images';

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
      // Form is valid - actual signup logic would go here
      alert('Alumni signup successful! Verification will be processed.');
      navigate('/login');
    }
  };

  // Generate passout years (last 50 years)
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
    <div className="min-h-screen flex items-center justify-center py-6 bg-gradient-to-br from-indigo-50 to-indigo-400">
      <div className="flex w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden">
        
        {/* Left side - Logo/Illustration */}
        <div className="hidden md:flex md:w-1/2 bg-indigo-50 items-center justify-center p-6">
          <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-md">
            <img 
              src={alumni_logo} 
              alt="Alumni Logo" 
              className="w-36 h-36 rounded-full object-cover"
            />
          </div>
          <div className="absolute bottom-6 text-center text-indigo-800">
            <h3 className="text-lg font-bold mb-1">Alumni Registration</h3>
            <p className="text-xs">Mentor the next generation</p>
          </div>
        </div>

        {/* Right side - Signup Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-4">
              Alumni Sign Up
            </h2>
            
            {/* Name Input */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 ml-1">Full Name *</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-indigo-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
              {errors.name && (
                <p className="text-red-500 text-xs font-medium ml-1">{errors.name}</p>
              )}
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 ml-1">Email Address *</label>
              <input
                type="email"
                name="email"
                placeholder="alumni@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-indigo-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
              {errors.email && (
                <p className="text-red-500 text-xs font-medium ml-1">{errors.email}</p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 ml-1">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-indigo-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs font-medium ml-1">{errors.phone}</p>
              )}
            </div>

            {/* Passout Year Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 ml-1">Passout Year *</label>
              <div className="relative">
                <select
                  name="passoutYear"
                  value={formData.passoutYear}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-indigo-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none text-sm"
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
              <label className="text-xs font-medium text-gray-700 ml-1">Department *</label>
              <div className="relative">
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-indigo-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none text-sm"
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
              <label className="text-xs font-medium text-gray-700 ml-1">Marksheet (for verification) *</label>
              <div className="relative">
                <input
                  type="file"
                  name="marksheet"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full px-3 py-2 bg-indigo-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>
              <p className="text-xs text-gray-500 ml-1 mt-0.5">Upload PDF, JPG, or PNG (Max 5MB)</p>
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
              <label className="text-xs font-medium text-gray-700 ml-1">Password *</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password (min. 6 characters)"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-indigo-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
              />
              {errors.password && (
                <p className="text-red-500 text-xs font-medium ml-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700 ml-1">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-indigo-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm"
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
              <label htmlFor="terms" className="text-xs text-gray-600">
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
              <label htmlFor="mentor" className="text-xs text-gray-600">
                I'm interested in mentoring students
              </label>
            </div>

            {/* Sign Up Button */}
            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 shadow-sm text-sm"
              >
                CREATE ALUMNI ACCOUNT
              </button>
            </div>

            {/* Divider */}
            <div className="relative py-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-gray-500 text-xs">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors text-sm"
              >
                Login to existing account
              </button>
            </div>
          </form>

          {/* Back to Home Link */}
          <div className="mt-4 text-center">
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

export default AlumniSignup;