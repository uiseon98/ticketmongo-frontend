import React, { useState, useEffect, useRef } from 'react';
import {
    X,
    Calendar,
    Clock,
    MapPin,
    Users,
    Image,
    AlertCircle,
    CheckCircle,
} from 'lucide-react';
import apiClient from '../../../shared/utils/apiClient.js';
import { concertService } from '../../concert/services/concertService.js';
import { fileUploadService } from '../../../shared/services/fileUploadService.js';

/**
 * ConcertForm.jsx
 *
 * 판매자용 콘서트 등록/수정 폼 컴포넌트
 * - 백엔드 SellerConcertController의 API와 완전히 일치
 * - POST /api/seller/concerts (생성)
 * - PUT /api/seller/concerts/{concertId} (수정)
 * - 백엔드 DTO 검증 규칙과 동일한 클라이언트 검증
 */
const ConcertForm = ({
    isOpen,
    onClose,
    onSuccess,
    concert = null, // 수정 모드일 때 기존 콘서트 데이터
    sellerId,
    modal = true, // 모달 모드 여부
}) => {
    // ====== 상태 관리 ======
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [filePreview, setFilePreview] = useState(null);
    const [imageLoadError, setImageLoadError] = useState(false);
    const [imageLoadTesting, setImageLoadTesting] = useState(false); // URL 테스트 중 상태
    const fileInputRef = useRef(null);

    // 폼 데이터 - 백엔드 DTO와 완전히 일치
    const [formData, setFormData] = useState({
        // 필수 필드들 (SellerConcertCreateDTO)
        title: '',
        artist: '',
        venueName: '',
        concertDate: '',
        startTime: '',
        endTime: '',
        totalSeats: '',
        bookingStartDate: '',
        bookingEndDate: '',

        // 선택 필드들
        description: '',
        venueAddress: '',
        minAge: 0,
        maxTicketsPerUser: 4,
        posterImageUrl: '',

        status: 'SCHEDULED',
    });

    const isEditMode = !!concert;

    // ====== 초기화 ======
    useEffect(() => {
        console.log(
            'ConcertForm useEffect - isEditMode:',
            isEditMode,
            'concert:',
            concert,
        );
        if (isEditMode && concert) {
            console.log('Setting form data with concert:', concert);
            // 수정 모드: 기존 데이터로 폼 초기화
            setFormData({
                title: concert.title || '',
                artist: concert.artist || '',
                description: concert.description || '',
                venueName: concert.venueName || '',
                venueAddress: concert.venueAddress || '',
                concertDate: concert.concertDate || '',
                startTime: concert.startTime || '',
                endTime: concert.endTime || '',
                totalSeats: concert.totalSeats?.toString() || '',
                bookingStartDate: concert.bookingStartDate
                    ? new Date(concert.bookingStartDate)
                          .toISOString()
                          .slice(0, 16)
                    : '',
                bookingEndDate: concert.bookingEndDate
                    ? new Date(concert.bookingEndDate)
                          .toISOString()
                          .slice(0, 16)
                    : '',
                minAge: concert.minAge || 0,
                maxTicketsPerUser: concert.maxTicketsPerUser || 4,
                posterImageUrl: concert.posterImageUrl || '',
                status: concert.status || 'SCHEDULED',
            });

            // 이미지 관련 상태 초기화
            setImageLoadError(false);
            setImageLoadTesting(false);
            setSelectedFile(null);
            setFilePreview(null);
            setUploadProgress(0);
            setUploading(false);

            // 파일 input 초기화
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } else {
            // 생성 모드: 기본값으로 초기화
            setFormData({
                title: '',
                artist: '',
                description: '',
                venueName: '',
                venueAddress: '',
                concertDate: '',
                startTime: '',
                endTime: '',
                totalSeats: '',
                bookingStartDate: '',
                bookingEndDate: '',
                minAge: 0,
                maxTicketsPerUser: 4,
                posterImageUrl: '',
                status: 'SCHEDULED',
            });
            setImageLoadError(false);
            setImageLoadTesting(false);
            setSelectedFile(null);
            setFilePreview(null);
            setUploadProgress(0);
            setUploading(false);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
        setErrors({});
        setSubmitError('');
        setSubmitSuccess('');
    }, [isEditMode, concert]);

    // ====== 입력 핸들러 ======
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;

        let processedValue = value;
        if (type === 'number') {
            processedValue = value === '' ? '' : Number(value);
        }

        setFormData((prev) => ({
            ...prev,
            [name]: processedValue,
        }));

        // 해당 필드의 에러 클리어
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    // ====== 클라이언트 검증 (백엔드 DTO 검증과 동일) ======
    const validateForm = () => {
        const newErrors = {};

        // 필수 문자열 필드 검증 (NotBlank)
        if (!formData.title?.trim()) {
            newErrors.title = '콘서트 제목은 필수입니다';
        } else if (formData.title.trim().length > 100) {
            newErrors.title = '콘서트 제목은 100자 이하여야 합니다';
        }

        if (!formData.artist?.trim()) {
            newErrors.artist = '아티스트명은 필수입니다';
        } else if (formData.artist.trim().length > 50) {
            newErrors.artist = '아티스트명은 50자 이하여야 합니다';
        }

        if (!formData.venueName?.trim()) {
            newErrors.venueName = '공연장명은 필수입니다';
        } else if (formData.venueName.trim().length > 100) {
            newErrors.venueName = '공연장명은 100자 이하여야 합니다';
        }

        // 선택 문자열 필드 길이 검증
        if (formData.description && formData.description.length > 1000) {
            newErrors.description = '콘서트 설명은 1000자 이하여야 합니다';
        }

        if (formData.venueAddress && formData.venueAddress.length > 200) {
            newErrors.venueAddress = '공연장 주소는 200자 이하여야 합니다';
        }

        // 날짜 필드 검증 (NotNull, Future)
        if (!formData.concertDate) {
            newErrors.concertDate = '콘서트 날짜는 필수입니다';
        } else {
            const concertDate = new Date(formData.concertDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (concertDate <= today) {
                newErrors.concertDate =
                    '콘서트 날짜는 현재 날짜보다 이후여야 합니다';
            }
        }

        // 시간 필드 검증 (NotNull)
        if (!formData.startTime) {
            newErrors.startTime = '시작 시간은 필수입니다';
        }

        if (!formData.endTime) {
            newErrors.endTime = '종료 시간은 필수입니다';
        }

        // 시간 순서 검증
        if (formData.startTime && formData.endTime) {
            if (formData.endTime <= formData.startTime) {
                newErrors.endTime = '종료 시간은 시작 시간보다 늦어야 합니다';
            }
        }

        // 좌석 수 검증 (NotNull, Positive, Max)
        if (!formData.totalSeats) {
            newErrors.totalSeats = '총 좌석 수는 필수입니다';
        } else {
            const seats = parseInt(formData.totalSeats);
            if (isNaN(seats) || seats <= 0) {
                newErrors.totalSeats = '총 좌석 수는 양수여야 합니다';
            } else if (seats > 100000) {
                newErrors.totalSeats = '총 좌석 수는 100,000석 이하여야 합니다';
            }
        }

        // 예매 일시 검증 (NotNull, Future)
        if (!formData.bookingStartDate) {
            newErrors.bookingStartDate = '예매 시작일시는 필수입니다';
        }

        if (!formData.bookingEndDate) {
            newErrors.bookingEndDate = '예매 종료일시는 필수입니다';
        }

        // 예매 시간 순서 검증
        if (formData.bookingStartDate && formData.bookingEndDate) {
            const bookingStart = new Date(formData.bookingStartDate);
            const bookingEnd = new Date(formData.bookingEndDate);

            if (bookingEnd <= bookingStart) {
                newErrors.bookingEndDate =
                    '예매 종료일시는 예매 시작일시보다 늦어야 합니다';
            }
        }

        // 예매 기간과 공연 날짜 검증
        if (
            formData.bookingEndDate &&
            formData.concertDate &&
            formData.startTime
        ) {
            const bookingEnd = new Date(formData.bookingEndDate);
            const concertStart = new Date(
                `${formData.concertDate}T${formData.startTime}`,
            );

            if (bookingEnd >= concertStart) {
                newErrors.bookingEndDate =
                    '예매 종료일시는 공연 시작 전이어야 합니다';
            }
        }

        // 연령 제한 검증 (Min, Max)
        const minAge = parseInt(formData.minAge);
        if (isNaN(minAge) || minAge < 0) {
            newErrors.minAge = '최소 연령은 0세 이상이어야 합니다';
        } else if (minAge > 100) {
            newErrors.minAge = '최소 연령은 100세 이하여야 합니다';
        }

        // 최대 티켓 수 검증 (Min, Max)
        const maxTickets = parseInt(formData.maxTicketsPerUser);
        if (isNaN(maxTickets) || maxTickets < 1) {
            newErrors.maxTicketsPerUser =
                '사용자당 최대 티켓 수는 1개 이상이어야 합니다';
        } else if (maxTickets > 10) {
            newErrors.maxTicketsPerUser =
                '사용자당 최대 티켓 수는 10개 이하여야 합니다';
        }

        // 포스터 URL 패턴 검증
        if (formData.posterImageUrl) {
            try {
                const url = new URL(formData.posterImageUrl);
                if (!['http:', 'https:'].includes(url.protocol)) {
                    newErrors.posterImageUrl = '올바른 URL 형식이 아닙니다';
                }
            } catch (e) {
                newErrors.posterImageUrl = '올바른 URL 형식이 아닙니다';
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ====== API 호출 ======

    /**
     * 콘서트 생성
     * POST /api/seller/concerts
     */
    const createConcert = async () => {
        const params = new URLSearchParams({
            sellerId: sellerId.toString(),
        });

        // 백엔드 SellerConcertCreateDTO에 맞는 데이터 구성
        const createData = {
            title: formData.title.trim(),
            artist: formData.artist.trim(),
            description: formData.description?.trim() || null,
            venueName: formData.venueName.trim(),
            venueAddress: formData.venueAddress?.trim() || null,
            concertDate: formData.concertDate,
            startTime: formData.startTime,
            endTime: formData.endTime,
            totalSeats: formData.totalSeats,
            bookingStartDate: formData.bookingStartDate,
            bookingEndDate: formData.bookingEndDate,
            minAge: formData.minAge,
            maxTicketsPerUser: formData.maxTicketsPerUser,
            posterImageUrl: formData.posterImageUrl?.trim() || null,
            status: formData.status,
        };

        return await concertService.createConcert(sellerId, createData);
    };

    /**
     * 콘서트 수정
     * PUT /api/seller/concerts/{concertId}
     */
    const updateConcert = async () => {
        const params = new URLSearchParams({
            sellerId: sellerId.toString(),
        });

        // 백엔드 SellerConcertUpdateDTO에 맞는 데이터 구성 (부분 수정 지원)
        const updateData = {};

        // 변경된 필드만 포함 (null/undefined 값은 제외)
        if (formData.title?.trim()) updateData.title = formData.title.trim();
        if (formData.artist?.trim()) updateData.artist = formData.artist.trim();
        if (formData.description !== undefined)
            updateData.description = formData.description?.trim() || null;
        if (formData.venueName?.trim())
            updateData.venueName = formData.venueName.trim();
        if (formData.venueAddress !== undefined)
            updateData.venueAddress = formData.venueAddress?.trim() || null;
        if (formData.concertDate) updateData.concertDate = formData.concertDate;
        if (formData.startTime) updateData.startTime = formData.startTime;
        if (formData.endTime) updateData.endTime = formData.endTime;
        if (formData.totalSeats) updateData.totalSeats = formData.totalSeats;
        if (formData.bookingStartDate)
            updateData.bookingStartDate = formData.bookingStartDate;
        if (formData.bookingEndDate)
            updateData.bookingEndDate = formData.bookingEndDate;
        if (formData.minAge !== undefined) updateData.minAge = formData.minAge;
        if (formData.maxTicketsPerUser !== undefined)
            updateData.maxTicketsPerUser = formData.maxTicketsPerUser;
        if (formData.status) updateData.status = formData.status;
        if (formData.posterImageUrl !== undefined)
            updateData.posterImageUrl = formData.posterImageUrl?.trim() || null;

        return await concertService.updateConcert(
            sellerId,
            concert.concertId,
            updateData,
        );
    };

    // ====== 파일 관련 핸들러 ======
    // 파일 선택 핸들러
    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 기존 선택된 파일과 미리보기 초기화
        setSelectedFile(null);
        setFilePreview(null);
        setImageLoadError(false);

        // 파일 검증
        const validation = fileUploadService.validateFile(file);
        if (!validation.valid) {
            alert(validation.error);
            // 파일 input 초기화
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }

        setSelectedFile(file);

        // 미리보기 생성
        try {
            const dataURL = await fileUploadService.fileToDataURL(file);
            setFilePreview(dataURL);
        } catch (error) {
            console.error('미리보기 생성 실패:', error);
            alert('이미지 미리보기 생성에 실패했습니다.');
        }
    };

    // 파일 업로드 실행 핸들러
    const handleFileUpload = async () => {
        if (!selectedFile) {
            alert('업로드할 파일을 선택해주세요.');
            return;
        }

        // 이미 업로드 중인 경우 중복 방지
        if (uploading) {
            alert('이미 업로드가 진행 중입니다.');
            return;
        }

        // 진행 중인 다른 업로드가 있는지 확인
        if (fileUploadService.getActiveUploadCount() > 0) {
            alert('다른 파일 업로드가 진행 중입니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            // 기존 이미지가 있는 경우 확인 메시지
            if (
                formData.posterImageUrl &&
                !confirm('기존 이미지를 새 이미지로 교체하시겠습니까?')
            ) {
                return;
            }
            const result = await fileUploadService.uploadPosterImage(
                selectedFile,
                isEditMode ? concert.concertId : null,
                (progress) => setUploadProgress(progress),
            );

            if (result && result.success !== false) {
                // 업로드 성공 시 URL을 폼에 설정
                const urlWithCacheBuster = `${result.data}?t=${Date.now()}`;

                setFormData((prev) => ({
                    ...prev,
                    posterImageUrl: urlWithCacheBuster,  // ✅ 캐시 버스터 적용
                }));
                setImageLoadError(false);
                alert('포스터 이미지가 업로드되었습니다!');

                // 선택된 파일 정보 초기화
                setSelectedFile(null);
                setFilePreview(null);

                // 파일 input 초기화
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                console.log('✅ 새 이미지 URL 설정 완료 (캐시 버스터 포함):', urlWithCacheBuster);
            } else {
                throw new Error(result?.message || '업로드에 실패했습니다.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert(`업로드 실패: ${error.message}`);

            // 실패 시에도 파일 관련 상태 초기화
            setSelectedFile(null);
            setFilePreview(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    // 선택된 파일 제거 핸들러
    const handleClearFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        setUploadProgress(0);
        setUploading(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
            // 파일 객체도 완전히 제거
            fileInputRef.current.files = null;
        }
    };

    // ====== URL 입력 핸들러 개선 ======
    const handlePosterUrlChange = async (e) => {
        const url = e.target.value;

        // 기본 input 변경 처리
        handleInputChange(e);

        // 이미지 로드 에러 상태 리셋
        setImageLoadError(false);
        setImageLoadTesting(false);

        // URL 형식만 검증하고, 실제 로드 테스트는 건너뛰기
        if (url.trim()) {
            const urlValidation = fileUploadService.validateImageUrl(url);
            if (!urlValidation.valid) {
                setImageLoadError(true);
            }
            // 실제 이미지 로드 테스트는 생략 (CORS 때문에)
        }
    };

    const handleRemoveUploadedImage = async () => {
        if (!formData.posterImageUrl) {
            return;
        }

        if (!confirm('포스터 이미지를 완전히 삭제하시겠습니까?\n(Supabase와 DB에서 모두 제거됩니다)')) {
            return;
        }

        try {
            const deleteResult = await fileUploadService.deleteConcertPoster(
                concert?.concertId, // 수정 모드에서만 사용
                sellerId
            );

            if (deleteResult.success) {
                // 프론트엔드 상태 초기화
                setFormData((prev) => ({
                    ...prev,
                    posterImageUrl: '',
                }));

                // 기타 상태 초기화
                setImageLoadError(false);
                setSelectedFile(null);
                setFilePreview(null);

                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }

                alert('포스터 이미지가 완전히 삭제되었습니다.');

            } else {
                alert(`포스터 삭제 실패: ${deleteResult.message}`);
            }

        } catch (error) {
            console.error('❌ 포스터 삭제 중 오류:', error);
            alert('포스터 삭제 중 오류가 발생했습니다.');
        }
    };

    const handleImageLoadError = () => {
        setImageLoadError(true);
    };

    const handleImageLoadSuccess = () => {
        setImageLoadError(false);
    };

    useEffect(() => {
        return () => {
            // 컴포넌트 언마운트 시 진행 중인 업로드 정리
            fileUploadService.clearActiveUploads();
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setSubmitError('');
        setSubmitSuccess('');

        try {
            const result = isEditMode
                ? await updateConcert()
                : await createConcert();

            if (result && result.success !== false) {
                setSubmitSuccess(
                    isEditMode
                        ? '콘서트가 수정되었습니다.'
                        : '콘서트가 성공적으로 등록되었습니다.',
                );

                // 성공 시 부모 컴포넌트에 알림
                setTimeout(() => {
                    onSuccess && onSuccess(result.data);
                    onClose();
                }, 1500);
            } else {
                setSubmitError(
                    result?.message || '처리 중 오류가 발생했습니다.',
                );

                setFormData(prev => ({
                    ...prev,
                    posterImageUrl: ''
                }));
            }
        } catch (error) {
            setSubmitError('네트워크 오류가 발생했습니다.');
            setFormData(prev => ({
                ...prev,
                posterImageUrl: ''
            }));
        } finally {
            setLoading(false);
        }
    };

    // 모달 모드가 아닐 때는 isOpen 체크 안 함
    if (modal && !isOpen) return null;

    // ====== 폼 컨텐츠 렌더링 함수 ======
    const renderFormContent = () => (
        <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 기본 정보 섹션 */}
                <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-4">
                        기본 정보
                    </h3>
                </div>

                {/* 콘서트 제목 */}
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        콘서트 제목{' '}
                        <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.title
                                ? 'border-red-500'
                                : 'border-gray-600'
                        } bg-gray-700 text-white placeholder-gray-400`}
                        placeholder="콘서트 제목을 입력하세요"
                        maxLength={100}
                    />
                    {errors.title && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.title}
                        </p>
                    )}
                </div>

                {/* 아티스트명 */}
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        아티스트명{' '}
                        <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="artist"
                        value={formData.artist}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.artist
                                ? 'border-red-500'
                                : 'border-gray-600'
                        } bg-gray-700 text-white placeholder-gray-400`}
                        placeholder="아티스트명을 입력하세요"
                        maxLength={50}
                    />
                    {errors.artist && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.artist}
                        </p>
                    )}
                </div>

                {/* 콘서트 설명 */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        콘서트 설명
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.description
                                ? 'border-red-500'
                                : 'border-gray-600'
                        } bg-gray-700 text-white placeholder-gray-400`}
                        placeholder="콘서트에 대한 상세 설명을 입력하세요"
                        maxLength={1000}
                    />
                    {errors.description && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.description}
                        </p>
                    )}
                </div>

                {/* 공연장 정보 섹션 */}
                <div className="md:col-span-2 mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <MapPin size={20} />
                        공연장 정보
                    </h3>
                </div>

                {/* 공연장명 */}
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        공연장명 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="venueName"
                        value={formData.venueName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.venueName
                                ? 'border-red-500'
                                : 'border-gray-600'
                        } bg-gray-700 text-white placeholder-gray-400`}
                        placeholder="공연장명을 입력하세요"
                        maxLength={100}
                    />
                    {errors.venueName && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.venueName}
                        </p>
                    )}
                </div>

                {/* 공연장 주소 */}
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        공연장 주소
                    </label>
                    <input
                        type="text"
                        name="venueAddress"
                        value={formData.venueAddress}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.venueAddress
                                ? 'border-red-500'
                                : 'border-gray-600'
                        } bg-gray-700 text-white placeholder-gray-400`}
                        placeholder="공연장 주소를 입력하세요"
                        maxLength={200}
                    />
                    {errors.venueAddress && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.venueAddress}
                        </p>
                    )}
                </div>

                {/* 일시 정보 섹션 */}
                <div className="md:col-span-2 mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Calendar size={20} />
                        일시 정보
                    </h3>
                </div>

                {/* 공연 날짜 */}
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        공연 날짜{' '}
                        <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="concertDate"
                        value={formData.concertDate}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.concertDate
                                ? 'border-red-500'
                                : 'border-gray-600'
                        } bg-gray-700 text-white`}
                    />
                    {errors.concertDate && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.concertDate}
                        </p>
                    )}
                </div>

                {/* 총 좌석 수 */}
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        총 좌석 수{' '}
                        <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="totalSeats"
                        value={formData.totalSeats}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.totalSeats
                                ? 'border-red-500'
                                : 'border-gray-600'
                        } bg-gray-700 text-white placeholder-gray-400`}
                        placeholder="총 좌석 수를 입력하세요"
                        min={1}
                        max={100000}
                    />
                    {errors.totalSeats && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.totalSeats}
                        </p>
                    )}
                </div>

                {/* 시작 시간 */}
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        시작 시간{' '}
                        <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.startTime
                                ? 'border-red-500'
                                : 'border-gray-600'
                        } bg-gray-700 text-white`}
                    />
                    {errors.startTime && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.startTime}
                        </p>
                    )}
                </div>

                {/* 종료 시간 */}
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        종료 시간{' '}
                        <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.endTime
                                ? 'border-red-500'
                                : 'border-gray-600'
                        } bg-gray-700 text-white`}
                    />
                    {errors.endTime && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.endTime}
                        </p>
                    )}
                </div>

                {/* 예매 정보 섹션 */}
                <div className="md:col-span-2 mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Clock size={20} />
                        예매 정보
                    </h3>
                </div>

                {/* 예매 시작일시 */}
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        예매 시작일시{' '}
                        <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        name="bookingStartDate"
                        value={formData.bookingStartDate}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.bookingStartDate
                                ? 'border-red-500'
                                : 'border-gray-600'
                        } bg-gray-700 text-white`}
                    />
                    {errors.bookingStartDate && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.bookingStartDate}
                        </p>
                    )}
                </div>

                {/* 예매 종료일시 */}
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        예매 종료일시{' '}
                        <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        name="bookingEndDate"
                        value={formData.bookingEndDate}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.bookingEndDate
                                ? 'border-red-500'
                                : 'border-gray-600'
                        } bg-gray-700 text-white`}
                    />
                    {errors.bookingEndDate && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.bookingEndDate}
                        </p>
                    )}
                </div>

                {/* 추가 설정 섹션 */}
                <div className="md:col-span-2 mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Users size={20} />
                        추가 설정
                    </h3>
                </div>

                {/* 최소 연령 */}
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        최소 연령 제한
                    </label>
                    <input
                        type="number"
                        name="minAge"
                        value={formData.minAge}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.minAge
                                ? 'border-red-500'
                                : 'border-gray-600'
                        } bg-gray-700 text-white placeholder-gray-400`}
                        placeholder="최소 연령을 입력하세요"
                        min={0}
                        max={100}
                    />
                    {errors.minAge && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.minAge}
                        </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                        0세는 연령 제한 없음을 의미합니다
                    </p>
                </div>

                {/* 사용자당 최대 티켓 수 */}
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        사용자당 최대 구매 티켓 수
                    </label>
                    <input
                        type="number"
                        name="maxTicketsPerUser"
                        value={formData.maxTicketsPerUser}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.maxTicketsPerUser
                                ? 'border-red-500'
                                : 'border-gray-600'
                        } bg-gray-700 text-white placeholder-gray-400`}
                        placeholder="최대 구매 가능 티켓 수"
                        min={1}
                        max={10}
                    />
                    {errors.maxTicketsPerUser && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.maxTicketsPerUser}
                        </p>
                    )}
                </div>

                {/* 콘서트 상태 선택 (생성/수정 모드 모두) */}
                <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        콘서트 상태
                    </label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="SCHEDULED">예정됨</option>
                        <option value="ON_SALE">예매중</option>
                        <option value="SOLD_OUT">매진</option>
                        <option value="CANCELLED">취소됨</option>
                        <option value="COMPLETED">완료됨</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-400">
                        {isEditMode
                            ? '상태 변경 시 신중하게 선택해주세요'
                            : '초기 콘서트 상태를 선택해주세요'}
                    </p>
                </div>

                {/* 포스터 이미지 섹션 */}
                <div className="md:col-span-2 mt-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Image size={20} />
                        포스터 이미지
                    </h3>
                </div>

                {/* 파일 업로드 섹션 */}
                <div className="md:col-span-2 mb-4">
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        포스터 이미지 파일 업로드
                    </label>

                    {/* 파일 선택 */}
                    <div className="flex gap-4 mb-4">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="flex-1 px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={uploading}
                        />

                        {selectedFile && (
                            <button
                                type="button"
                                onClick={handleFileUpload}
                                disabled={uploading}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading
                                    ? `업로드 중... ${uploadProgress}%`
                                    : '업로드'}
                            </button>
                        )}

                        {selectedFile && !uploading && (
                            <button
                                type="button"
                                onClick={handleClearFile}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                            >
                                취소
                            </button>
                        )}
                    </div>

                    {/* 선택된 파일 정보 */}
                    {selectedFile && (
                        <div className="text-sm text-gray-400 mb-2">
                            선택된 파일: {selectedFile.name} (
                            {fileUploadService.formatFileSize(
                                selectedFile.size,
                            )}
                            )
                        </div>
                    )}

                    {/* 업로드 진행률 바 */}
                    {uploading && (
                        <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                    )}

                    {/* 파일 미리보기 */}
                    {filePreview && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-200 mb-2">
                                업로드할 이미지 미리보기
                            </p>
                            <div className="w-32 h-48 border border-gray-600 rounded-lg overflow-hidden">
                                <img
                                    src={filePreview}
                                    alt="업로드할 이미지 미리보기"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}

                    <p className="text-xs text-gray-400 mt-2">
                        또는 아래에 직접 URL을 입력하세요
                    </p>
                </div>

                {/* 포스터 이미지 URL */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                        포스터 이미지 URL (직접 입력)
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="url"
                                name="posterImageUrl"
                                value={formData.posterImageUrl}
                                onChange={handlePosterUrlChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.posterImageUrl || imageLoadError
                                        ? 'border-red-500'
                                        : 'border-gray-600'
                                } bg-gray-700 text-white placeholder-gray-400`}
                                placeholder="https://example.com/poster.jpg"
                            />
                            {imageLoadTesting && (
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>

                        {formData.posterImageUrl && (
                            <button
                                type="button"
                                onClick={handleRemoveUploadedImage}
                                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                title="이미지 제거"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {errors.posterImageUrl && (
                        <p className="mt-1 text-sm text-red-500">
                            {errors.posterImageUrl}
                        </p>
                    )}

                    {imageLoadError && formData.posterImageUrl && !imageLoadTesting && (
                        <div className="mt-2 p-3 bg-yellow-800 border border-yellow-600 rounded text-yellow-200 text-sm">
                            <div className="flex items-center gap-2">
                                <span>⚠️</span>
                                <div>
                                    <div className="font-medium">이미지를 불러올 수 없습니다</div>
                                    <div className="text-xs mt-1 text-yellow-300">
                                        • URL이 올바른지 확인해주세요<br/>
                                        • 외부 사이트의 경우 접근 제한이 있을 수 있습니다<br/>
                                        • 파일 업로드를 이용하시는 것을 권장합니다
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <p className="mt-1 text-xs text-gray-400">
                        지원 형식: jpg, jpeg, png, gif, webp<br/>
                        외부 이미지는 CORS 정책에 따라 로드되지 않을 수 있습니다.
                    </p>

                    {formData.posterImageUrl && !errors.posterImageUrl && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-200">
                                    미리보기
                                </p>
                                <button
                                    type="button"
                                    onClick={handleRemoveUploadedImage}
                                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                >
                                    이미지 제거
                                </button>
                            </div>
                            <div className="w-32 h-48 border border-gray-600 rounded-lg overflow-hidden relative">
                                {!imageLoadError ? (
                                    <>
                                        <img
                                            src={formData.posterImageUrl}
                                            alt="포스터 미리보기"
                                            className="w-full h-full object-cover"
                                            onError={handleImageLoadError}
                                            onLoad={handleImageLoadSuccess}
                                        />
                                        {imageLoadTesting && (
                                            <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
                                                <div className="text-center text-white">
                                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                                    <div className="text-xs">로딩 중...</div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full bg-gray-800 text-gray-400 flex flex-col items-center justify-center text-sm p-4">
                                        <div className="text-center">
                                            <div className="text-red-400 mb-2 text-lg">⚠️</div>
                                            <div className="text-xs leading-relaxed">
                                                이미지를 불러올 수<br/>
                                                없습니다.<br/>
                                                URL을 확인해주세요.
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {imageLoadError && (
                                <div className="mt-2 text-xs text-blue-400">
                                    💡 파일 업로드를 이용하면 더 안정적으로 이미지를 등록할 수 있습니다.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 폼 액션 버튼들 */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-600">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg transition-colors"
                    disabled={loading}
                >
                    취소
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {loading
                        ? '처리 중...'
                        : isEditMode
                          ? '수정하기'
                          : '등록하기'}
                </button>
            </div>
        </form>
    );

    // ====== 렌더링 (모달 모드) ======
    if (modal) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-800 text-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-600">
                    {/* 헤더 */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-600">
                        <h2 className="text-2xl font-bold text-white">
                            {isEditMode ? '콘서트 수정' : '콘서트 등록'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-200 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* 성공/에러 메시지 */}
                    {submitSuccess && (
                        <div className="mx-6 mt-4 p-4 bg-green-800 border border-green-600 rounded-lg flex items-center gap-2">
                            <CheckCircle size={20} className="text-green-600" />
                            <span className="text-green-100">
                                {submitSuccess}
                            </span>
                        </div>
                    )}
                    {submitError && (
                        <div className="mx-6 mt-4 p-4 bg-red-800 border border-red-600 rounded-lg flex items-center gap-2">
                            <AlertCircle size={20} className="text-red-600" />
                            <span className="text-red-100">{submitError}</span>
                        </div>
                    )}

                    {/* 폼 */}
                    {renderFormContent()}
                </div>
            </div>
        );
    }

    // ====== 렌더링 (페이지 모드) ======
    return (
        <div className="w-full">
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full mx-auto border border-gray-600">
                {/* 성공/에러 메시지 */}
                {submitSuccess && (
                    <div className="mb-4 p-4 bg-green-800 border-green-600 border rounded-lg flex items-center gap-2">
                        <CheckCircle size={20} className="text-green-300" />
                        <span className="text-green-100">{submitSuccess}</span>
                    </div>
                )}

                {submitError && (
                    <div className="mb-4 p-4 bg-red-800 border-red-600 border rounded-lg flex items-center gap-2">
                        <AlertCircle size={20} className="text-red-300" />
                        <span className="text-red-100">{submitError}</span>
                    </div>
                )}

                {/* 폼 */}
                {renderFormContent()}
            </div>
        </div>
    );
};

export default ConcertForm;