import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Upload, X } from 'lucide-react';
import { registerUser } from '../../features/auth/services/registerService';
import { AccountForm } from '../../features/auth/services/AccountForm';
import { SignupInput } from '../../features/auth/components/RegisterForm';
import { registerInputType } from '../../features/auth/types/registerInputType';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    nickname: '',
    phone: '',
    address: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const errorRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (errorMessage && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errorMessage]);

  const handleInputChange = field => e => {
    let value = e.target.value;

    if (field === 'phone') {
      value = AccountForm.formatPhoneNumber(value);
    }

    const updatedData = {
      ...formData,
      [field]: value,
    };

    setFormData(updatedData);

    const error = AccountForm.validateField(field, value, updatedData);
    setErrors(prev => ({
      ...prev,
      [field]: error,
    }));

    if (field === 'password' && formData.confirmPassword) {
      const confirmError =
        formData.confirmPassword !== value
          ? '비밀번호가 일치하지 않습니다.'
          : '';
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmError,
      }));
    }
  };

  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        setProfileImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async () => {
    setErrorMessage('');

    const newErrors = AccountForm.validateAllFields(formData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setErrorMessage('입력 정보를 다시 확인해주세요.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('이용약관과 개인정보처리방침에 동의해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser(formData);
      if (result.success) {
        navigate('/auth/login');
      } else {
        setErrorMessage(result.error);
      }
    } catch (error) {
      setErrorMessage(error || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const closeErrorMessage = () => {
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Error Message Banner */}
      {errorMessage && (
        <div
          ref={errorRef}
          className="bg-red-600 border-l-4 border-red-700 text-white p-4 relative"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={closeErrorMessage}
              className="flex-shrink-0 ml-4 p-1 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">계정 만들기</h1>
            <p className="text-gray-400 text-sm">
              커뮤니티에 참여하고 안전하게 티켓 거래를 시작하세요
            </p>
          </div>

          {/* Signup Form */}
          {registerInputType.map(
            ({ name, type, icon, placeholder, placeholderFull, toggle }) => (
              <SignupInput
                key={name}
                icon={icon}
                name={name}
                type={type}
                placeholder={placeholder}
                placeholderFull={placeholderFull}
                value={formData[name]}
                error={errors[name]}
                onChange={handleInputChange(name)}
                showToggle={toggle}
                showValue={
                  name === 'password'
                    ? showPassword
                    : name === 'confirmPassword'
                      ? showConfirmPassword
                      : false
                }
                onToggle={() =>
                  name === 'password'
                    ? setShowPassword(prev => !prev)
                    : name === 'confirmPassword'
                      ? setShowConfirmPassword(prev => !prev)
                      : null
                }
              />
            )
          )}

          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
              프로필 이미지
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center overflow-hidden">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-orange-600" />
                )}
              </div>
              <label className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-gray-300" />
                <span className="text-gray-300 text-sm">파일 업로드</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={e => setAgreeTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="terms" className="text-sm text-gray-400 text-left">
              <span className="text-blue-400 hover:text-blue-300 cursor-pointer">
                이용약관
              </span>
              과{' '}
              <span className="text-blue-400 hover:text-blue-300 cursor-pointer">
                개인정보처리방침
              </span>
              에 동의합니다
            </label>
          </div>

          {/* Create Account Button */}
          <button
            onClick={handleRegister}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            {isLoading ? '처리 중...' : '계정 만들기'}
          </button>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              이미 계정이 있으신가요?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-400 hover:text-blue-300 underline transition-colors"
              >
                로그인
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
