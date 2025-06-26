import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Mail, User, Lock, Phone, MapPin, UserPlus, Upload, X } from 'lucide-react';

export default function TicketMonSignup() {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        nickname: '',
        phoneNumber: '',
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

    useEffect(() => {
        if (errorMessage && errorRef.current) {
            errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [errorMessage]);

    // 유효성 검증 함수들
    const validateEmail = (email) => {
        const emailRegex = /^[a-z0-9]+@[a-z0-9]+\.[a-z]+$/;
        return emailRegex.test(email);
    };

    const validateUsername = (username) => {
        const idRegex = /^[a-z0-9]+$/;
        return idRegex.test(username);
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+=-])[A-Za-z\d!@#$%^&*()_+=-]{8,}$/;
        return passwordRegex.test(password);
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^01[016789]-\d{3,4}-\d{4}$/;
        return phoneRegex.test(phone);
    };

    const validateField = (field, value) => {
        let error = '';

        switch (field) {
            case 'email':
                if (!value.trim()) {
                    error = '이메일은 필수입니다.';
                } else if (!validateEmail(value)) {
                    error = '이메일은 영어 소문자와 숫자만 사용 가능합니다.';
                }
                break;
            case 'username':
                if (!value.trim()) {
                    error = '사용자 아이디는 필수입니다.';
                } else if (value.length < 3 || value.length > 20) {
                    error = '아이디는 4자 이상 20자 이하로 입력해주세요.';
                } else if (!validateUsername(value)) {
                    error = '아이디는 영어 소문자와 숫자만 사용 가능합니다.';
                }
                break;
            case 'password':
                if (!value.trim()) {
                    error = '비밀번호는 필수입니다.';
                } else if (!validatePassword(value)) {
                    error = '비밀번호는 최소 8자 이상이며, 소문자, 숫자, 특수문자를 포함해야 합니다.';
                }
                break;
            case 'confirmPassword':
                if (!value.trim()) {
                    error = '비밀번호 확인은 필수입니다.';
                } else if (value !== formData.password) {
                    error = '비밀번호가 일치하지 않습니다.';
                }
                break;
            case 'name':
                if (!value.trim()) {
                    error = '사용자 이름은 필수입니다.';
                } else if (value.length > 100) {
                    error = '이름은 100자 이하로 입력해주세요.';
                }
                break;
            case 'nickname':
                if (!value.trim()) {
                    error = '사용자 닉네임은 필수입니다.';
                } else if (value.length > 20) {
                    error = '닉네임은 20자 이하로 입력해주세요.';
                }
                break;
            case 'phoneNumber':
                if (!value.trim()) {
                    error = '전화번호는 필수입니다.';
                } else if (!validatePhone(value)) {
                    error = '올바른 전화번호 형식이 아닙니다. 예: 010-1234-5678';
                }
                break;
            case 'address':
                if (!value.trim()) {
                    error = '사용자 주소는 필수입니다.';
                }
                break;
            default:
                break;
        }

        return error;
    };

    // 전화번호 포맷팅 함수
    const formatPhoneNumber = (value) => {
        // 숫자만 추출
        const numbers = value.replace(/[^\d]/g, '');

        // 길이에 따라 포맷팅
        if (numbers.length <= 3) {
            return numbers;
        } else if (numbers.length <= 7) {
            return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        } else if (numbers.length <= 11) {
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
        } else {
            // 11자리 초과시 11자리까지만 사용
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
        }
    };

    const handleInputChange = (field) => (e) => {
        let value = e.target.value;

        // 전화번호 필드인 경우 포맷팅 적용
        if (field === 'phoneNumber') {
            value = formatPhoneNumber(value);
        }

        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));

        // 실시간 유효성 검증
        const error = validateField(field, value);
        setErrors((prev) => ({
            ...prev,
            [field]: error,
        }));

        // 비밀번호 확인 재검증 (비밀번호가 변경될 때)
        if (field === 'password' && formData.confirmPassword) {
            const confirmError = formData.confirmPassword !== value ? '비밀번호가 일치하지 않습니다.' : '';
            setErrors((prev) => ({
                ...prev,
                confirmPassword: confirmError,
            }));
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateAllFields = () => {
        const newErrors = {};
        Object.keys(formData).forEach((field) => {
            const error = validateField(field, formData[field]);
            if (error) {
                newErrors[field] = error;
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignup = async () => {
        // 기존 오류 메시지 초기화
        setErrorMessage('');

        if (!validateAllFields()) {
            setErrorMessage('입력 정보를 다시 확인해주세요.');
            return;
        }

        if (!agreeTerms) {
            setErrorMessage('이용약관과 개인정보처리방침에 동의해주세요.');
            return;
        }

        setIsLoading(true);

        try {
            console.log('회원가입 시도:', formData);
            // const result = await registerUser(formData);
            // console.log('result : ', result);

            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Simulate success
            alert('회원가입이 완료되었습니다!');
            // 성공 시 폼 초기화 또는 페이지 이동 등의 로직 추가 가능
        } catch (error) {
            setErrorMessage('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };

    const closeErrorMessage = () => {
        setErrorMessage('');
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Header */}
            <header className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-500 rounded"></div>
                    <span className="text-white text-lg font-semibold">TicketMon</span>
                </div>
                <button className="text-gray-300 hover:text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                    홈
                </button>
            </header>

            {/* Error Message Banner */}
            {errorMessage && (
                <div ref={errorRef} className="bg-red-600 border-l-4 border-red-700 text-white p-4 relative">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
                        <p className="text-gray-400 text-sm">커뮤니티에 참여하고 안전하게 티켓 거래를 시작하세요</p>
                    </div>

                    {/* Signup Form */}
                    <div className="space-y-4 text-left">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 text-left">이메일 *</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange('email')}
                                    placeholder="이메일을 입력하세요"
                                    className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-left ${
                                        errors.email ? 'border-red-500' : 'border-gray-700'
                                    }`}
                                />
                            </div>
                            {errors.email && <p className="text-red-400 text-xs mt-1 text-left">{errors.email}</p>}
                        </div>

                        {/* ID */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 text-left">아이디 *</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={handleInputChange('username')}
                                    placeholder="아이디를 입력하세요"
                                    className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-left ${
                                        errors.id ? 'border-red-500' : 'border-gray-700'
                                    }`}
                                />
                            </div>
                            <p className="text-gray-500 text-xs mt-1 text-left">
                                영문 소문자, 숫자만 사용 가능 (4-20자)
                            </p>
                            {errors.username && (
                                <p className="text-red-400 text-xs mt-1 text-left">{errors.username}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 text-left">비밀번호 *</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={handleInputChange('password')}
                                    placeholder="비밀번호를 입력하세요"
                                    className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-left ${
                                        errors.password ? 'border-red-500' : 'border-gray-700'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="text-gray-500 text-xs mt-1 text-left">
                                최소 8자 이상, 소문자, 숫자, 특수문자 포함
                            </p>
                            {errors.password && (
                                <p className="text-red-400 text-xs mt-1 text-left">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                                비밀번호 확인 *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange('confirmPassword')}
                                    placeholder="비밀번호를 다시 입력하세요"
                                    className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-left ${
                                        errors.confirmPassword ? 'border-red-500' : 'border-gray-700'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-400 text-xs mt-1 text-left">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 text-left">이름 *</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={handleInputChange('name')}
                                    placeholder="이름을 입력하세요"
                                    className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-left ${
                                        errors.fullName ? 'border-red-500' : 'border-gray-700'
                                    }`}
                                />
                            </div>
                            {errors.name && <p className="text-red-400 text-xs mt-1 text-left">{errors.name}</p>}
                        </div>

                        {/* Nickname */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 text-left">닉네임 *</label>
                            <div className="relative">
                                <UserPlus className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.nickname}
                                    onChange={handleInputChange('nickname')}
                                    placeholder="닉네임을 입력하세요"
                                    className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-left ${
                                        errors.nickname ? 'border-red-500' : 'border-gray-700'
                                    }`}
                                />
                            </div>
                            <p className="text-gray-500 text-xs mt-1 text-left">20자 이내로 입력해주세요</p>
                            {errors.nickname && (
                                <p className="text-red-400 text-xs mt-1 text-left">{errors.nickname}</p>
                            )}
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 text-left">전화번호 *</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange('phoneNumber')}
                                    placeholder="010-1234-5678"
                                    className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-left ${
                                        errors.phoneNumber ? 'border-red-500' : 'border-gray-700'
                                    }`}
                                />
                            </div>
                            <p className="text-gray-500 text-xs mt-1 text-left">
                                휴대폰 번호 형식으로 입력해주세요 (예: 010-1234-5678)
                            </p>
                            {errors.phoneNumber && (
                                <p className="text-red-400 text-xs mt-1 text-left">{errors.phoneNumber}</p>
                            )}
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 text-left">주소 *</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={handleInputChange('address')}
                                    placeholder="주소를 입력하세요"
                                    className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-left ${
                                        errors.address ? 'border-red-500' : 'border-gray-700'
                                    }`}
                                />
                            </div>
                            {errors.address && <p className="text-red-400 text-xs mt-1 text-left">{errors.address}</p>}
                        </div>

                        {/* Profile Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                                프로필 이미지
                            </label>
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center overflow-hidden">
                                    {profileImage ? (
                                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
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
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                className="mt-1 w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-400 text-left">
                                <span className="text-blue-400 hover:text-blue-300 cursor-pointer">이용약관</span>과{' '}
                                <span className="text-blue-400 hover:text-blue-300 cursor-pointer">
                                    개인정보처리방침
                                </span>
                                에 동의합니다
                            </label>
                        </div>

                        {/* Create Account Button */}
                        <button
                            onClick={handleSignup}
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
                                    onClick={() => console.log('Navigate to sign in')}
                                    className="text-blue-400 hover:text-blue-300 underline transition-colors"
                                >
                                    로그인
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
