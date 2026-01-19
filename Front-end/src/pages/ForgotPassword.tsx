import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

type FormData = {
  email: string;
};

type FormErrors = {
  email?: string;
};

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    email: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name as keyof FormErrors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      console.log('Password reset link sent to:', formData.email);
      // API call goes here
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-400">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 md:p-10">
        
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
          Forgot Password
        </h2>

        <p className="text-gray-600 text-center mb-8 text-sm">
          Enter your registered email and we’ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div className="space-y-2">
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-6 py-3 bg-blue-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {errors.email && (
              <p className="text-red-500 text-sm font-medium ml-4">
                {errors.email}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-full hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 shadow-md"
          >
            SEND RESET LINK
          </button>
        </form>

        {/* Navigation Links */}
        <div className="mt-8 text-center space-y-3">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors block w-full"
          >
            Back to Login
          </button>

          <Link
            to="/"
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors block"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
