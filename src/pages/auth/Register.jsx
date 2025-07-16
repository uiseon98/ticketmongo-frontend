import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Upload, X } from 'lucide-react';
import {
    registerUser,
    oauthRegisterUser,
} from '../../features/auth/services/registerService';
import { AccountForm } from '../../features/auth/services/AccountForm';
import { SignupInput } from '../../features/auth/components/RegisterForm';
import { registerInputType } from '../../features/auth/types/registerInputType';
import { NotificationSection } from '../../features/user/components/BookingDetail/NotificationSection';
import { NOTIFICATION_TYPE } from '../../features/user/services/bookingDetailService';

// 반응형 Hook (Profile.jsx와 동일)
const useResponsive = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [screenWidth, setScreenWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200,
    );

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setScreenWidth(width);
            setIsMobile(width <= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        isMobile,
        isTablet: screenWidth <= 1024 && screenWidth > 768,
        isDesktop: screenWidth > 1024,
        screenWidth,
    };
};

export default function Register() {
    const { isMobile, isTablet } = useResponsive();
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        name: '',
        nickname: '',
        phone: '',
        address: '',
        isSocialUser: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [profileImage, setProfileImage] = useState(null); // 실제 파일
    const [profilePreview, setProfilePreview] = useState(null); // 미리보기용
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const paramError = params.get('error');
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (paramError === 'need_signup') {
            showNotification(
                '소셜 로그인 회원가입 필요',
                NOTIFICATION_TYPE.INFO,
            );

            const handleOauthUserInfo = async () => {
                try {
                    const result = await oauthRegisterUser();
                    if (result.success) {
                        setFormData((prev) => ({
                            ...prev,
                            email: result.data.email,
                            name: result.data.name,
                            isSocialUser: true,
                        }));
                    } else {
                        showNotification(result.error, NOTIFICATION_TYPE.ERROR);
                    }
                } catch {
                    showNotification(
                        '서버 오류로 사용자 정보를 불러올 수 없습니다.',
                        NOTIFICATION_TYPE.ERROR,
                    );
                }
            };

            handleOauthUserInfo();
        }
    }, [paramError]);

    const showNotification = (message, type = NOTIFICATION_TYPE.INFO) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleInputChange = (field) => (e) => {
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
        setErrors((prev) => ({
            ...prev,
            [field]: error,
        }));

        if (field === 'password' && formData.confirmPassword) {
            const confirmError =
                formData.confirmPassword !== value
                    ? '비밀번호가 일치하지 않습니다.'
                    : '';
            setErrors((prev) => ({
                ...prev,
                confirmPassword: confirmError,
            }));
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const errorMsg = AccountForm.validateImageFile(file);
        if (errorMsg) {
            showNotification(errorMsg, NOTIFICATION_TYPE.ERROR);
            return;
        }

        // 파일 객체 저장
        setProfileImage(file);

        // 미리보기용 이미지 URL 저장
        const reader = new FileReader();
        reader.onload = (e) => {
            setProfilePreview(e.target.result); // base64 문자열
        };
        reader.readAsDataURL(file);
    };

    const handleRegister = async () => {
        const newErrors = AccountForm.validateAllFields(formData);
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            showNotification(
                '입력 정보를 다시 확인해주세요.',
                NOTIFICATION_TYPE.ERROR,
            );
            return;
        }

        if (!agreeTerms) {
            showNotification(
                '이용약관과 개인정보처리방침에 동의해주세요.',
                NOTIFICATION_TYPE.ERROR,
            );
            return;
        }

        const payload = new FormData();

        // 일반 필드 추가
        Object.entries(formData).forEach(([key, value]) => {
            payload.append(key, value);
        });

        // 파일 추가
        if (profileImage) {
            payload.append('profileImage', profileImage);
        }

        setIsLoading(true);
        try {
            const result = await registerUser(payload); // FormData 넘김
            if (result.success) {
                navigate('/login');
            } else {
                showNotification(result.error, NOTIFICATION_TYPE.ERROR);
            }
        } catch (error) {
            showNotification(
                error.message || '회원가입 중 오류가 발생했습니다.',
                NOTIFICATION_TYPE.ERROR,
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            style={{
                backgroundColor: '#111827', // gray-900
                minHeight: '100vh',
                width: '100vw',
                margin: 0,
                padding: 0,
                overflowX: 'hidden',
            }}
        >
            <div
                className={
                    isMobile
                        ? 'p-4 overflow-x-hidden'
                        : isTablet
                          ? 'max-w-5xl mx-auto p-4 overflow-x-hidden'
                          : 'max-w-7xl mx-auto p-6 overflow-x-hidden'
                }
                style={{
                    backgroundColor: '#111827',
                    minHeight: '100vh',
                    color: '#FFFFFF',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {/* 알림 */}
                {notification && (
                    <div className="fixed top-4 right-4 z-50">
                        <NotificationSection notification={notification} />
                    </div>
                )}

                {/* Page Title */}
                <div className="text-center mb-8">
                    <h2
                        className={
                            isMobile
                                ? 'text-2xl font-bold mb-2 break-words'
                                : isTablet
                                  ? 'text-3xl font-bold mb-2 break-words'
                                  : 'text-4xl font-bold mb-2 break-words'
                        }
                        style={{
                            color: '#FFFFFF',
                            wordBreak: 'keep-all',
                            overflowWrap: 'break-word',
                        }}
                    >
                        계정 만들기
                    </h2>
                    <p
                        className="text-gray-400"
                        style={{
                            fontSize: isMobile ? '14px' : '16px',
                            padding: isMobile ? '0 16px' : '0',
                        }}
                    >
                        커뮤니티에 참여하고 안전하게 티켓 거래를 시작하세요
                    </p>
                </div>

                {/* Content Area - Profile.jsx와 동일한 카드 스타일 */}
                <div
                    className="w-full"
                    style={{
                        maxWidth: isMobile
                            ? '100%'
                            : isTablet
                              ? '600px'
                              : '700px',
                    }}
                >
                    <div
                        className="rounded-2xl"
                        style={{
                            backgroundColor: '#1f2937', // gray-800
                            border: '1px solid #374151', // gray-700
                            padding: isMobile
                                ? '20px'
                                : isTablet
                                  ? '24px'
                                  : '32px',
                        }}
                    >
                        <div className="space-y-6">
                            {/* Signup Form Fields */}
                            {registerInputType.map(
                                ({
                                    name,
                                    type,
                                    icon,
                                    placeholder,
                                    placeholderFull,
                                    toggle,
                                }) => {
                                    const isPasswordField =
                                        name === 'password' ||
                                        name === 'confirmPassword';

                                    const isDisabled =
                                        formData.isSocialUser &&
                                        isPasswordField;

                                    placeholderFull =
                                        isDisabled && isPasswordField
                                            ? '소셜 로그인 사용자는 입력할 필요가 없습니다'
                                            : placeholderFull;

                                    return (
                                        <div key={name} className="space-y-2">
                                            <SignupInput
                                                icon={icon}
                                                name={name}
                                                type={type}
                                                placeholder={placeholder}
                                                placeholderFull={
                                                    placeholderFull
                                                }
                                                value={formData[name]}
                                                error={errors[name]}
                                                onChange={handleInputChange(
                                                    name,
                                                )}
                                                disabled={isDisabled}
                                                showToggle={toggle}
                                                showValue={
                                                    name === 'password'
                                                        ? showPassword
                                                        : name ===
                                                            'confirmPassword'
                                                          ? showConfirmPassword
                                                          : false
                                                }
                                                onToggle={() =>
                                                    name === 'password'
                                                        ? setShowPassword(
                                                              (prev) => !prev,
                                                          )
                                                        : name ===
                                                            'confirmPassword'
                                                          ? setShowConfirmPassword(
                                                                (prev) => !prev,
                                                            )
                                                          : null
                                                }
                                            />
                                        </div>
                                    );
                                },
                            )}

                            {/* 프로필 이미지 업로드 */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                    프로필 이미지
                                </label>
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-orange-300 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-600">
                                        {profilePreview ? (
                                            <img
                                                src={profilePreview}
                                                alt="Profile Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-8 h-8 text-orange-600" />
                                        )}
                                    </div>
                                    <label className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg cursor-pointer transition-colors border border-gray-600">
                                        <Upload className="w-4 h-4 text-gray-300" />
                                        <span className="text-gray-300 text-sm font-medium">
                                            파일 업로드
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </label>
                                    {profilePreview && (
                                        <button
                                            onClick={() => {
                                                setProfileImage(null);
                                                setProfilePreview(null);
                                            }}
                                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                                            title="이미지 제거"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    JPG, PNG 파일만 업로드 가능 (최대 5MB)
                                </p>
                            </div>

                            {/* 이용약관 동의 */}
                            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={agreeTerms}
                                        onChange={(e) =>
                                            setAgreeTerms(e.target.checked)
                                        }
                                        className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                                    />
                                    <label
                                        htmlFor="terms"
                                        className="text-sm text-gray-300"
                                    >
                                        <span className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">
                                            이용약관
                                        </span>{' '}
                                        및{' '}
                                        <span className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">
                                            개인정보처리방침
                                        </span>
                                        에 동의합니다
                                    </label>
                                </div>
                            </div>

                            {/* 회원가입 버튼 */}
                            <button
                                onClick={handleRegister}
                                disabled={isLoading || !agreeTerms}
                                className={`w-full font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center space-x-2 ${
                                    isLoading || !agreeTerms
                                        ? 'bg-gray-600 cursor-not-allowed text-gray-300'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                            >
                                {isLoading && (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                )}
                                <span>
                                    {isLoading ? '처리 중...' : '계정 만들기'}
                                </span>
                            </button>

                            {/* 로그인 링크 */}
                            <div className="text-center pt-6 mt-6 border-t border-gray-600">
                                <p className="text-gray-400 text-sm">
                                    이미 계정이 있으신가요?{' '}
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="mx-2 text-white hover:text-blue-300 font-medium transition-colors"
                                    >
                                        로그인
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 모바일에서 하단 여백 */}
                {isMobile && <div className="h-16" aria-hidden="true"></div>}
            </div>
        </div>
    );
}
