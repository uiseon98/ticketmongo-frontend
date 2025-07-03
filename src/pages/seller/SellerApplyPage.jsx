import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../shared/utils/apiClient';
import LoadingSpinner from '../../shared/components/ui/LoadingSpinner';
import ErrorMessage from '../../shared/components/ui/ErrorMessage';
import InputField from '../../shared/components/ui/InputField';
import Button from '../../shared/components/ui/Button';
import SuccessMessage from '../../shared/components/ui/SuccessMessage';

const SellerApplyPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [sellerStatus, setSellerStatus] = useState(null); // 판매자 상태 데이터를 위한 새로운 state
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(null); // 에러 상태
    const [successMessage, setSuccessMessage] = useState(null); // 성공 메시지 상태

    // 폼 데이터 상태
    const [formData, setFormData] = useState({
        companyName: '',
        businessNumber: '',
        representativeName: '',
        representativePhone: '',
    });
    const [businessLicenseFile, setBusinessLicenseFile] = useState(null); // 파일 상태
    const [filePreview, setFilePreview] = useState(null); // 파일 미리보기 URL

    // 폼 유효성 검사 상태 (간단한 예시)
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        const fetchSellerStatusAndControlAccess = async () => {
            if (!user) {
                navigate('/unauthorized', { replace: true });
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get('/users/me/seller-status'); // 최신 판매자 상태 조회
                const currentStatus = response.data.approvalStatus; // API 응답에서 approvalStatus 가져오기
                setSellerStatus(response.data); // 전체 DTO 데이터 저장

                // 판매자 권한 신청이 불가능한 상태 (이미 신청 대기 중이거나 승인된 경우)에는 리다이렉트
                // (null, REJECTED, WITHDRAWN, REVOKED 상태일 때만 신청/재신청 가능)
                if (
                    currentStatus === 'PENDING' ||
                    currentStatus === 'APPROVED'
                ) {
                    //
                    alert(
                        '현재 상태에서는 판매자 권한 신청/재신청을 할 수 없습니다.',
                    );
                    navigate('/seller/status', { replace: true });
                }
                // 과거 신청 이력이 있는 경우 (REJECTED, WITHDRAWN, REVOKED) 기존 데이터 로드 (재신청 시)
                // SellerApplicationStatusResponseDTO에 해당 필드들이 있다고 가정
                else if (response.data.companyName) {
                    setFormData({
                        companyName: response.data.companyName,
                        businessNumber: response.data.businessNumber,
                        representativeName: response.data.representativeName,
                        representativePhone: response.data.representativePhone,
                    });
                    // 파일 URL도 있다면 미리보기 설정 (백엔드에서 URL을 보내줄 경우)
                    // if (response.data.uploadedFileUrl) {
                    //     setFilePreview(response.data.uploadedFileUrl);
                    // }
                }
            } catch (err) {
                console.error('판매자 상태 조회 실패 (SellerApplyPage):', err);
                setError(
                    err.response?.data?.message ||
                        '판매자 상태를 불러오는데 실패했습니다. (권한 확인 불가)',
                );
                // 에러 발생 시에도 접근을 막는 것이 안전
                navigate('/seller/status', { replace: true }); // 상태를 알 수 없으므로 상태 페이지로 리다이렉트
            } finally {
                setLoading(false);
            }
        };

        fetchSellerStatusAndControlAccess();
    }, [user, navigate]);

    // 입력 필드 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // 에러 메시지 즉시 제거 (사용자가 입력할 때)
        setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    // 파일 입력 변경 핸들러
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBusinessLicenseFile(file);
            setFilePreview(URL.createObjectURL(file)); // 파일 미리보기 URL 생성
        } else {
            setBusinessLicenseFile(null);
            setFilePreview(null);
        }
        setFormErrors((prev) => ({ ...prev, businessLicenseFile: undefined }));
    };

    // 폼 유효성 검사 (간단한 예시, 필요시 shared/utils/validation.js 활용)
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
            errors.representativePhone = '담당자 연락처를 입력해주세요.';
        else if (!/^0\d{1,2}\d{3,4}\d{4}$/.test(formData.representativePhone))
            errors.representativePhone =
                '담당자 연락처는 유효한 전화번호 형식(숫자만)이어야 합니다.';
        if (!businessLicenseFile && !sellerStatus?.uploadedFileUrl)
            errors.businessLicenseFile = '사업자 등록증 파일을 업로드해주세요.'; // 재신청 시 기존 파일이 없으면 필수

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // 폼 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccessMessage(null); // 이전 성공 메시지 초기화

        if (!validateForm()) {
            alert('모든 필수 정보를 올바르게 입력해주세요.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const form = new FormData();
            form.append(
                'request',
                new Blob([JSON.stringify(formData)], {
                    type: 'application/json',
                }),
            ); // DTO를 JSON Blob으로 추가
            if (businessLicenseFile) {
                form.append('document', businessLicenseFile); // 파일은 'document' 이름으로 추가
            }

            // API-03-06: 판매자 권한 신청
            const response = await apiClient.post(
                '/users/me/seller-requests',
                form,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data', // 파일 업로드를 위해 필수
                    },
                },
            );

            setSuccessMessage(
                response.message ||
                    '판매자 권한 신청이 성공적으로 접수되었습니다.',
            ); // response.data.message 대신 response.message 사용
            // 성공 시 상태 페이지로 리다이렉트
            setTimeout(() => {
                navigate('/seller/status', { replace: true });
            }, 2000); // 2초 후 리다이렉트
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

    // 뒤로가기 핸들러
    const handleGoBack = () => {
        navigate('/seller/status');
    };

    if (loading) {
        return <LoadingSpinner message="판매자 신청 페이지 로딩 중..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    // 성공 메시지가 있을 경우 표시
    if (successMessage) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] bg-[#111922] text-white p-4">
                <SuccessMessage message={successMessage} />
                <Button
                    onClick={() => navigate('/seller/status')}
                    className="mt-4"
                >
                    상태 페이지로 이동
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6 bg-[#111922] text-white min-h-[calc(100vh-64px)]">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">판매자 권한 신청</h2>
                <button
                    onClick={handleGoBack}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition duration-300"
                >
                    뒤로가기
                </button>
            </div>
            <p className="mb-8">
                판매자 권한을 신청하는 페이지입니다. 필요한 정보를 입력해주세요.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField
                    label="업체명"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="예: (주)티켓몬 공연기획"
                    error={formErrors.companyName}
                    required
                />
                <InputField
                    label="사업자등록번호"
                    name="businessNumber"
                    value={formData.businessNumber}
                    onChange={handleChange}
                    placeholder="하이픈 없이 10자리 숫자"
                    error={formErrors.businessNumber}
                    required
                />
                <InputField
                    label="담당자 이름"
                    name="representativeName"
                    value={formData.representativeName}
                    onChange={handleChange}
                    placeholder="예: 김철수"
                    error={formErrors.representativeName}
                    required
                />
                <InputField
                    label="담당자 연락처"
                    name="representativePhone"
                    value={formData.representativePhone}
                    onChange={handleChange}
                    placeholder="숫자만 입력 (예: 01012345678)"
                    error={formErrors.representativePhone}
                    required
                />

                {/* 사업자 등록증 파일 업로드 */}
                <div className="flex flex-col">
                    <label
                        htmlFor="businessLicenseFile"
                        className="block text-sm font-medium text-gray-300 mb-2"
                    >
                        사업자 등록증 파일{' '}
                        <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="file"
                        id="businessLicenseFile"
                        name="businessLicenseFile"
                        accept="image/*,application/pdf" // 이미지 및 PDF 파일 허용
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-400
                       file:mr-4 file:py-2 file:px-4
                       file:rounded-md file:border-0
                       file:text-sm file:font-semibold
                       file:bg-[#243447] file:text-white
                       hover:file:bg-[#2e405a] cursor-pointer"
                    />
                    {formErrors.businessLicenseFile && (
                        <p className="mt-1 text-sm text-red-500">
                            {formErrors.businessLicenseFile}
                        </p>
                    )}
                    {filePreview && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-400 mb-2">
                                파일 미리보기:
                            </p>
                            {businessLicenseFile?.type.startsWith('image/') ? (
                                <img
                                    src={filePreview}
                                    alt="파일 미리보기"
                                    className="max-w-xs max-h-48 object-contain border border-gray-700 rounded-md"
                                />
                            ) : (
                                <p className="text-gray-500">
                                    PDF 파일은 미리보기를 지원하지 않습니다.
                                    파일이 업로드됩니다.
                                </p>
                            )}
                        </div>
                    )}
                    {sellerStatus?.uploadedFileUrl &&
                        !businessLicenseFile && ( // 기존 파일이 있고 새 파일이 선택되지 않았을 때
                            <div className="mt-2 text-sm text-gray-400">
                                기존 업로드 파일:{' '}
                                <a
                                    href={sellerStatus.uploadedFileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline"
                                >
                                    파일 보기
                                </a>
                                (새 파일을 업로드하면 기존 파일은 대체됩니다.)
                            </div>
                        )}
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? '신청 중...' : '판매자 권한 신청'}
                </Button>
            </form>
        </div>
    );
};

export default SellerApplyPage;
