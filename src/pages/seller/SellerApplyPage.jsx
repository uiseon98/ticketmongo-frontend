import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../shared/utils/apiClient';
import LoadingSpinner from '../../shared/components/ui/LoadingSpinner';
import ErrorMessage from '../../shared/components/ui/ErrorMessage';
import InputField from '../../shared/components/ui/InputField';
import Button from '../../shared/components/ui/Button';
import SuccessMessage from '../../shared/components/ui/SuccessMessage';
import {
    formatPhoneNumber,
    formatBusinessNumber,
} from '../../shared/utils/formatters';

// 반응형 Hook (다른 페이지들과 동일)
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

const SellerApplyPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { isMobile, isTablet } = useResponsive();

    const [sellerStatus, setSellerStatus] = useState(null);
    const [applicantInfo, setApplicantInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // 폼 데이터 상태
    const [formData, setFormData] = useState({
        companyName: '',
        businessNumber: '',
        representativeName: '',
        representativePhone: '',
    });
    const [businessLicenseFile, setBusinessLicenseFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');

    // "Same as applicant" 체크박스 상태
    const [sameAsApplicant, setSameAsApplicant] = useState(false);

    // 폼 유효성 검사 상태
    const [formErrors, setFormErrors] = useState({});

    // 드래그 앤 드롭 영역의 상태
    const [isDragOver, setIsDragOver] = useState(false);

    useEffect(() => {
        const fetchRequiredDataAndControlAccess = async () => {
            if (!user) {
                navigate('/unauthorized', { replace: true });
                return;
            }

            setLoading(true);
            setError(null);
            try {
                // 1. 판매자 상태 조회 (접근 제어용)
                const sellerStatusResponse = await apiClient.get(
                    '/users/me/seller-status',
                );
                const currentStatus = sellerStatusResponse.data.approvalStatus;
                setSellerStatus(sellerStatusResponse.data);

                // 2. 신청자 상세 정보 조회 (UI 표시용)
                const applicantInfoResponse = await apiClient.get(
                    '/users/me/applicant-info',
                );
                setApplicantInfo(applicantInfoResponse.data);

                // 3. 접근 제어 로직 (신청 불가능 상태면 리다이렉트)
                if (
                    currentStatus === 'PENDING' ||
                    currentStatus === 'APPROVED'
                ) {
                    alert(
                        '현재 상태에서는 판매자 권한 신청/재신청을 할 수 없습니다.',
                    );
                    navigate('/seller/status', { replace: true });
                }
                // 4. 재신청 시 기존 데이터 로드
                else if (sellerStatusResponse.data.companyName) {
                    setFormData({
                        companyName: sellerStatusResponse.data.companyName,
                        businessNumber:
                            sellerStatusResponse.data.businessNumber,
                        representativeName:
                            sellerStatusResponse.data.representativeName,
                        representativePhone:
                            sellerStatusResponse.data.representativePhone,
                    });
                    if (sellerStatusResponse.data.uploadedFileUrl) {
                        setFilePreview(
                            sellerStatusResponse.data.uploadedFileUrl,
                        );
                    }
                }
            } catch (err) {
                console.error('판매자 상태 조회 실패 (SellerApplyPage):', err);
                setError(
                    err.response?.data?.message ||
                        '판매자 상태를 불러오는데 실패했습니다. (권한 확인 불가)',
                );
                navigate('/seller/status', { replace: true });
            } finally {
                setLoading(false);
            }
        };

        fetchRequiredDataAndControlAccess();
    }, [user, navigate]);

    // "Same as applicant" 체크박스 핸들러
    useEffect(() => {
        if (sameAsApplicant && applicantInfo) {
            setFormData((prev) => ({
                ...prev,
                representativeName: applicantInfo.name || '',
                representativePhone: (applicantInfo.phone || '').replace(
                    /[^0-9]/g,
                    '',
                ),
            }));
        } else if (!sameAsApplicant) {
            if (!sellerStatus || (sellerStatus && !sellerStatus.companyName)) {
                setFormData((prev) => ({
                    ...prev,
                    representativeName: '',
                    representativePhone: '',
                }));
            } else {
                setFormData((prev) => ({
                    ...prev,
                    representativeName: sellerStatus.representativeName || '',
                    representativePhone: (
                        sellerStatus.representativePhone || ''
                    ).replace(/[^0-9]/g, ''),
                }));
            }
        }
    }, [sameAsApplicant, applicantInfo, sellerStatus]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let processedValue = value;

        if (name === 'businessNumber' || name === 'representativePhone') {
            processedValue = value.replace(/[^0-9]/g, '');
        }

        setFormData((prev) => ({ ...prev, [name]: processedValue }));
        setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBusinessLicenseFile(file);
            setFilePreview(URL.createObjectURL(file));
            setSelectedFileName(file.name);
        } else {
            setBusinessLicenseFile(null);
            setFilePreview(null);
            setSelectedFileName('');
        }
        setFormErrors((prev) => ({ ...prev, businessLicenseFile: undefined }));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const mockEvent = { target: { files: [files[0]] } };
            handleFileChange(mockEvent);
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.companyName)
            errors.companyName = '업체명을 입력해주세요.';
        if (!formData.businessNumber)
            errors.businessNumber = '사업자등록번호를 입력해주세요.';
        else if (!/^[0-9]{10}$/.test(formData.businessNumber))
            errors.businessNumber = '사업자등록번호는 10자리 숫자여야 합니다.';
        if (!formData.representativeName)
            errors.representativeName = '담당자 이름을 입력해주세요.';
        if (!formData.representativePhone)
            errors.representativePhone = '담당자 연락처는 필수입니다.';
        else if (!/^0\d{1,2}\d{3,4}\d{4}$/.test(formData.representativePhone))
            errors.representativePhone =
                '담당자 연락처는 유효한 전화번호 형식(숫자만)이어야 합니다.';
        if (!businessLicenseFile && !sellerStatus?.uploadedFileUrl)
            errors.businessLicenseFile = '사업자 등록증 파일을 업로드해주세요.';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage(null);

        if (!validateForm()) {
            alert('모든 필수 정보를 올바르게 입력해주세요.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const cleanedFormData = {
                ...formData,
                businessNumber: formData.businessNumber.replace(/[^0-9]/g, ''),
                representativePhone: formData.representativePhone.replace(
                    /[^0-9]/g,
                    '',
                ),
            };

            const form = new FormData();
            form.append(
                'request',
                new Blob([JSON.stringify(cleanedFormData)], {
                    type: 'application/json',
                }),
            );
            if (businessLicenseFile) {
                form.append('document', businessLicenseFile);
            }

            const response = await apiClient.post(
                '/users/me/seller-requests',
                form,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
            );

            setSuccessMessage(
                response.message ||
                    '판매자 권한 신청이 성공적으로 접수되었습니다.',
            );
            setTimeout(() => {
                navigate('/seller/status', { replace: true });
            }, 2000);
        } catch (err) {
            console.error('판매자 권한 신청 실패:', err.response?.data);
            setError(
                err.response?.data?.message ||
                    '판매자 권한 신청에 실패했습니다.',
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = () => {
        navigate('/seller/status');
    };

    // 로딩 상태 - 다른 페이지들과 동일한 스타일
    if (loading) {
        return (
            <div
                style={{
                    backgroundColor: '#111827',
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
                              ? 'max-w-4xl mx-auto p-4 overflow-x-hidden'
                              : 'max-w-6xl mx-auto p-6 overflow-x-hidden'
                    }
                    style={{
                        backgroundColor: '#111827',
                        minHeight: '100vh',
                        color: '#FFFFFF',
                        boxSizing: 'border-box',
                    }}
                >
                    <h1
                        className={
                            isMobile
                                ? 'text-xl font-bold mb-4 text-center break-words'
                                : isTablet
                                  ? 'text-2xl font-bold mb-5 text-center break-words'
                                  : 'text-4xl font-bold mb-6 text-center break-words'
                        }
                        style={{
                            color: '#FFFFFF',
                            padding: isMobile ? '0 8px' : '0',
                            wordBreak: 'keep-all',
                            overflowWrap: 'break-word',
                        }}
                    >
                        판매자 권한 신청
                    </h1>

                    <div
                        className="rounded-xl shadow-md"
                        style={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            padding: isMobile
                                ? '40px 20px'
                                : isTablet
                                  ? '50px 30px'
                                  : '60px 40px',
                            textAlign: 'center',
                            maxWidth: isMobile ? '100%' : '600px',
                            margin: '0 auto',
                        }}
                    >
                        <div
                            style={{
                                width: isMobile ? '32px' : '40px',
                                height: isMobile ? '32px' : '40px',
                                border: '4px solid #374151',
                                borderTop: '4px solid #3B82F6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 16px',
                            }}
                        />
                        <div
                            style={{
                                color: '#FFFFFF',
                                fontSize: isMobile ? '14px' : '18px',
                            }}
                        >
                            판매자 신청 페이지 로딩 중...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div
                style={{
                    backgroundColor: '#111827',
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
                              ? 'max-w-4xl mx-auto p-4 overflow-x-hidden'
                              : 'max-w-6xl mx-auto p-6 overflow-x-hidden'
                    }
                    style={{
                        backgroundColor: '#111827',
                        minHeight: '100vh',
                        color: '#FFFFFF',
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        className="rounded-xl shadow-md text-center"
                        style={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            padding: isMobile ? '32px 24px' : '40px 32px',
                            maxWidth: '500px',
                            width: '100%',
                        }}
                    >
                        <div className="text-6xl mb-6">⚠️</div>
                        <h3
                            className={`font-bold text-red-400 mb-4 ${isMobile ? 'text-xl' : 'text-2xl'}`}
                        >
                            오류가 발생했습니다
                        </h3>
                        <p
                            className={`text-gray-300 mb-6 leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}
                        >
                            {error}
                        </p>
                        <button
                            onClick={() => navigate('/seller/status')}
                            className={`bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all ${
                                isMobile
                                    ? 'w-full py-4 px-6 text-lg'
                                    : 'py-3 px-8 text-base'
                            }`}
                        >
                            상태 페이지로 이동
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 성공 메시지가 있을 경우 표시
    if (successMessage) {
        return (
            <div
                style={{
                    backgroundColor: '#111827',
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
                              ? 'max-w-4xl mx-auto p-4 overflow-x-hidden'
                              : 'max-w-6xl mx-auto p-6 overflow-x-hidden'
                    }
                    style={{
                        backgroundColor: '#111827',
                        minHeight: '100vh',
                        color: '#FFFFFF',
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        className="rounded-xl shadow-md text-center"
                        style={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            padding: isMobile ? '40px 24px' : '48px 40px',
                            maxWidth: '500px',
                            width: '100%',
                        }}
                    >
                        <div className="text-6xl mb-6">✅</div>
                        <h3
                            className={`font-bold text-green-400 mb-4 ${isMobile ? 'text-xl' : 'text-2xl'}`}
                        >
                            신청이 완료되었습니다
                        </h3>
                        <p
                            className={`text-gray-300 mb-8 leading-relaxed ${isMobile ? 'text-base' : 'text-lg'}`}
                        >
                            {successMessage}
                        </p>
                        <button
                            onClick={() => navigate('/seller/status')}
                            className={`bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all ${
                                isMobile
                                    ? 'w-full py-4 px-6 text-lg'
                                    : 'py-3 px-8 text-base'
                            }`}
                        >
                            상태 페이지로 이동
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // applicantInfo에서 직접 값을 가져와 변수에 할당
    const applicantId = applicantInfo?.id || 'N/A';
    const applicantNickname = applicantInfo?.nickname || 'N/A';
    const applicantName = applicantInfo?.name || 'N/A';
    const applicantEmail = applicantInfo?.email || 'N/A';
    const applicantPhone = applicantInfo?.phone || 'N/A';

    return (
        <div
            style={{
                backgroundColor: '#111827', // gray-900 - 다른 페이지들과 동일
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
                          ? 'max-w-4xl mx-auto p-4 overflow-x-hidden'
                          : 'max-w-6xl mx-auto p-6 overflow-x-hidden'
                }
                style={{
                    backgroundColor: '#111827',
                    minHeight: '100vh',
                    color: '#FFFFFF',
                    boxSizing: 'border-box',
                }}
            >
                {/* 페이지 제목 - 다른 페이지들과 동일한 스타일 */}
                <h1
                    className={
                        isMobile
                            ? 'text-xl font-bold mb-4 text-center break-words'
                            : isTablet
                              ? 'text-2xl font-bold mb-5 text-center break-words'
                              : 'text-4xl font-bold mb-6 text-center break-words'
                    }
                    style={{
                        color: '#FFFFFF',
                        padding: isMobile ? '0 8px' : '0',
                        wordBreak: 'keep-all',
                        overflowWrap: 'break-word',
                    }}
                >
                    판매자 권한 신청
                </h1>

                {/* 부제목 - 다른 페이지들과 동일한 스타일 */}
                <p
                    className={`text-center mb-${isMobile ? '6' : isTablet ? '8' : '10'} text-gray-400`}
                    style={{
                        fontSize: isMobile ? '14px' : '16px',
                        padding: isMobile ? '0 16px' : '0',
                    }}
                >
                    판매자 권한을 신청하여 콘서트를 등록하고 관리하세요.
                </p>

                {/* 콘텐츠 영역 - 다른 페이지들과 동일한 간격 시스템 */}
                <div
                    className={`space-y-${isMobile ? '4' : isTablet ? '5' : '8'}`}
                >
                    {/* 뒤로가기 버튼 */}
                    <div
                        className="rounded-xl shadow-md"
                        style={{
                            backgroundColor: '#1f2937', // gray-800
                            border: '1px solid #374151', // gray-700
                            padding: isMobile
                                ? '16px'
                                : isTablet
                                  ? '20px'
                                  : '24px',
                        }}
                    >
                        <button
                            onClick={handleGoBack}
                            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                        >
                            ← 이전 페이지로
                        </button>
                    </div>

                    {/* 신청자 정보 섹션 */}
                    <div
                        className="rounded-xl shadow-md"
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
                        <h3
                            className={`font-bold text-white mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}
                        >
                            📋 신청자 정보
                        </h3>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-lg">👤</span>
                            </div>
                            <div className="flex-1">
                                <div
                                    className={`space-y-2 ${isMobile ? 'text-sm' : 'text-base'}`}
                                >
                                    <p className="text-gray-300">
                                        <span className="font-medium text-white">
                                            닉네임:
                                        </span>{' '}
                                        {applicantNickname}
                                        <span className="ml-4 font-medium text-white">
                                            사용자 ID:
                                        </span>{' '}
                                        {applicantId}
                                    </p>
                                    <p className="text-gray-300">
                                        <span className="font-medium text-white">
                                            이름:
                                        </span>{' '}
                                        {applicantName}
                                    </p>
                                    <p className="text-gray-300">
                                        <span className="font-medium text-white">
                                            이메일:
                                        </span>{' '}
                                        {applicantEmail}
                                    </p>
                                    <p className="text-gray-300">
                                        <span className="font-medium text-white">
                                            연락처:
                                        </span>{' '}
                                        {applicantPhone}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 신청 폼 섹션 */}
                    <div
                        className="rounded-xl shadow-md"
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
                        <h3
                            className={`font-bold text-white mb-6 ${isMobile ? 'text-lg' : 'text-xl'}`}
                        >
                            🏢 사업자 정보
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Company Name */}
                            <div>
                                <label
                                    className={`block text-white font-medium mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}
                                >
                                    업체명 *
                                </label>
                                <input
                                    type="text"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                    placeholder="예: (주)티켓몬 공연기획"
                                    className={`w-full p-3 rounded-lg text-white placeholder-gray-500 ${isMobile ? 'text-sm' : 'text-base'}`}
                                    style={{
                                        backgroundColor: '#374151',
                                        border: formErrors.companyName
                                            ? '1px solid #ef4444'
                                            : '1px solid #4b5563',
                                    }}
                                    required
                                />
                                {formErrors.companyName && (
                                    <p className="mt-1 text-sm text-red-400">
                                        {formErrors.companyName}
                                    </p>
                                )}
                            </div>

                            {/* Business Registration Number */}
                            <div>
                                <label
                                    className={`block text-white font-medium mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}
                                >
                                    사업자등록번호 *
                                </label>
                                <input
                                    type="text"
                                    name="businessNumber"
                                    value={formatBusinessNumber(
                                        formData.businessNumber,
                                    )}
                                    onChange={handleChange}
                                    placeholder="하이픈 없이 10자리 숫자"
                                    className={`w-full p-3 rounded-lg text-white placeholder-gray-500 ${isMobile ? 'text-sm' : 'text-base'}`}
                                    style={{
                                        backgroundColor: '#374151',
                                        border: formErrors.businessNumber
                                            ? '1px solid #ef4444'
                                            : '1px solid #4b5563',
                                    }}
                                    required
                                />
                                {formErrors.businessNumber && (
                                    <p className="mt-1 text-sm text-red-400">
                                        {formErrors.businessNumber}
                                    </p>
                                )}
                            </div>

                            {/* Representative Name */}
                            <div>
                                <label
                                    className={`block text-white font-medium mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}
                                >
                                    담당자 이름 *
                                </label>
                                <input
                                    type="text"
                                    name="representativeName"
                                    value={formData.representativeName}
                                    onChange={handleChange}
                                    placeholder="예: 김철수"
                                    disabled={sameAsApplicant}
                                    className={`w-full p-3 rounded-lg text-white placeholder-gray-500 ${isMobile ? 'text-sm' : 'text-base'} ${sameAsApplicant ? 'opacity-60' : ''}`}
                                    style={{
                                        backgroundColor: '#374151',
                                        border: formErrors.representativeName
                                            ? '1px solid #ef4444'
                                            : '1px solid #4b5563',
                                    }}
                                    required
                                />
                                {formErrors.representativeName && (
                                    <p className="mt-1 text-sm text-red-400">
                                        {formErrors.representativeName}
                                    </p>
                                )}
                            </div>

                            {/* Representative Phone */}
                            <div>
                                <label
                                    className={`block text-white font-medium mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}
                                >
                                    담당자 연락처 *
                                </label>
                                <input
                                    type="text"
                                    name="representativePhone"
                                    value={formatPhoneNumber(
                                        formData.representativePhone,
                                    )}
                                    onChange={handleChange}
                                    placeholder="숫자만 입력 (예: 01012345678)"
                                    disabled={sameAsApplicant}
                                    className={`w-full p-3 rounded-lg text-white placeholder-gray-500 ${isMobile ? 'text-sm' : 'text-base'} ${sameAsApplicant ? 'opacity-60' : ''}`}
                                    style={{
                                        backgroundColor: '#374151',
                                        border: formErrors.representativePhone
                                            ? '1px solid #ef4444'
                                            : '1px solid #4b5563',
                                    }}
                                    required
                                />
                                {formErrors.representativePhone && (
                                    <p className="mt-1 text-sm text-red-400">
                                        {formErrors.representativePhone}
                                    </p>
                                )}
                            </div>

                            {/* "Same as applicant" 체크박스 */}
                            <div
                                className="p-4 rounded-xl"
                                style={{
                                    backgroundColor: '#374151',
                                    border: '1px solid #4b5563',
                                }}
                            >
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={sameAsApplicant}
                                        onChange={(e) =>
                                            setSameAsApplicant(e.target.checked)
                                        }
                                        className="w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                    />
                                    <span
                                        className={`text-gray-300 ${isMobile ? 'text-sm' : 'text-base'}`}
                                    >
                                        신청자와 동일
                                    </span>
                                </label>
                            </div>

                            {/* Upload Supporting Documents 섹션 */}
                            <div>
                                <h4
                                    className={`font-bold text-white mb-4 ${isMobile ? 'text-base' : 'text-lg'}`}
                                >
                                    📎 제출 서류 업로드
                                </h4>
                                <p
                                    className={`text-gray-400 mb-4 ${isMobile ? 'text-sm' : 'text-base'}`}
                                >
                                    PDF 또는 JPG 파일 (최대 10MB)
                                </p>

                                {/* 드래그 앤 드롭 영역 */}
                                <div
                                    className={`border-dashed border-2 p-6 rounded-xl text-center cursor-pointer transition-colors ${
                                        isDragOver
                                            ? 'border-blue-500 bg-blue-50 bg-opacity-10'
                                            : 'border-gray-500'
                                    }`}
                                    style={{
                                        backgroundColor: isDragOver
                                            ? '#1e293b'
                                            : '#374151',
                                        minHeight: isMobile ? '120px' : '150px',
                                    }}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <label
                                        htmlFor="businessLicenseFile"
                                        className="cursor-pointer block h-full w-full flex flex-col items-center justify-center"
                                    >
                                        <div className="text-4xl mb-3">📁</div>
                                        <p
                                            className={`text-white font-bold mb-2 ${isMobile ? 'text-sm' : 'text-lg'}`}
                                        >
                                            파일을 여기로 드래그 앤 드롭하거나
                                            클릭하여 찾아보기
                                        </p>
                                        <p
                                            className={`text-gray-400 mb-4 ${isMobile ? 'text-xs' : 'text-sm'}`}
                                        >
                                            Drag and drop files here or click to
                                            browse
                                        </p>
                                        <input
                                            type="file"
                                            id="businessLicenseFile"
                                            name="businessLicenseFile"
                                            accept="image/*,application/pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                document
                                                    .getElementById(
                                                        'businessLicenseFile',
                                                    )
                                                    .click()
                                            }
                                            className={`bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors ${
                                                isMobile
                                                    ? 'py-2 px-4 text-sm'
                                                    : 'py-3 px-6 text-base'
                                            }`}
                                        >
                                            파일 선택
                                        </button>
                                    </label>

                                    {formErrors.businessLicenseFile && (
                                        <p className="mt-3 text-sm text-red-400">
                                            {formErrors.businessLicenseFile}
                                        </p>
                                    )}

                                    {filePreview && (
                                        <div className="mt-4">
                                            <p
                                                className={`text-gray-400 mb-2 ${isMobile ? 'text-sm' : 'text-base'}`}
                                            >
                                                파일 미리보기:{' '}
                                                <span className="text-white font-semibold">
                                                    {selectedFileName}
                                                </span>
                                            </p>
                                            {businessLicenseFile?.type.startsWith(
                                                'image/',
                                            ) ? (
                                                <img
                                                    src={filePreview}
                                                    alt="파일 미리보기"
                                                    className="max-w-xs max-h-48 object-contain border border-gray-700 rounded-md mx-auto"
                                                />
                                            ) : (
                                                <p className="text-gray-500">
                                                    PDF 파일은 미리보기를
                                                    지원하지 않습니다. 파일이
                                                    업로드됩니다.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {sellerStatus?.uploadedFileUrl &&
                                        !businessLicenseFile && (
                                            <div className="mt-2 text-sm text-gray-400">
                                                기존 업로드 파일:{' '}
                                                <a
                                                    href={
                                                        sellerStatus.uploadedFileUrl
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:underline"
                                                >
                                                    파일 보기
                                                </a>
                                                (새 파일을 업로드하면 기존
                                                파일은 대체됩니다.)
                                            </div>
                                        )}
                                </div>
                            </div>

                            {/* 제출 버튼 */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full font-medium rounded-lg transition-all ${
                                    isMobile
                                        ? 'py-4 px-6 text-lg'
                                        : 'py-3 px-8 text-base'
                                } ${
                                    loading
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                                style={{
                                    minHeight: isMobile ? '52px' : 'auto',
                                }}
                            >
                                {loading ? '신청 중...' : '판매자 권한 신청'}
                            </button>
                        </form>
                    </div>

                    {/* 안내 정보 (데스크톱에서만 표시) */}
                    {!isMobile && (
                        <div
                            className="rounded-xl shadow-md"
                            style={{
                                backgroundColor: '#1f2937', // gray-800
                                border: '1px solid #374151', // gray-700
                                padding: '24px',
                            }}
                        >
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                💡 신청 안내
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300 leading-relaxed">
                                <div>
                                    <h4 className="text-blue-400 mb-3 font-semibold">
                                        필수 제출 서류
                                    </h4>
                                    <ul className="space-y-1 pl-4">
                                        <li>
                                            • 사업자등록증 (PDF 또는 이미지)
                                        </li>
                                        <li>• 정확한 사업자등록번호 입력</li>
                                        <li>• 담당자 연락처 (본인 확인용)</li>
                                        <li>• 업체명 및 대표자 정보</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-green-400 mb-3 font-semibold">
                                        심사 과정
                                    </h4>
                                    <ul className="space-y-1 pl-4">
                                        <li>• 신청 후 관리자 검토 진행</li>
                                        <li>• 평균 1-3일 내 결과 통보</li>
                                        <li>
                                            • 승인 시 즉시 판매자 기능 이용 가능
                                        </li>
                                        <li>• 반려 시 재신청 가능</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 플로팅 도움말 버튼 (모바일에서만) */}
                {isMobile && (
                    <button
                        onClick={() => {
                            alert(
                                `💡 신청 안내\n\n필수 제출 서류:\n• 사업자등록증 (PDF 또는 이미지)\n• 정확한 사업자등록번호 입력\n• 담당자 연락처 (본인 확인용)\n• 업체명 및 대표자 정보\n\n심사 과정:\n• 신청 후 관리자 검토 진행\n• 평균 1-3일 내 결과 통보\n• 승인 시 즉시 판매자 기능 이용 가능\n• 반려 시 재신청 가능`,
                            );
                        }}
                        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg z-50 flex items-center justify-center transition-all"
                        style={{
                            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
                        }}
                        onTouchStart={(e) => {
                            e.target.style.transform = 'scale(0.95)';
                        }}
                        onTouchEnd={(e) => {
                            e.target.style.transform = 'scale(1)';
                        }}
                        aria-label="도움말"
                    >
                        💡
                    </button>
                )}

                {/* 모바일에서 하단 여백 - 다른 페이지들과 동일 */}
                {isMobile && <div className="h-16" aria-hidden="true"></div>}
            </div>
        </div>
    );
};

export default SellerApplyPage;
