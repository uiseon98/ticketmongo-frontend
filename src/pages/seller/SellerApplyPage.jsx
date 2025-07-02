import React, { useContext, useEffect, useState } from 'react'; // useState 추가
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../shared/utils/apiClient';
import LoadingSpinner from '../../shared/components/ui/LoadingSpinner';
import ErrorMessage from '../../shared/components/ui/ErrorMessage';

const SellerApplyPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [sellerStatus, setSellerStatus] = useState(null); // 판매자 상태 데이터를 위한 새로운 state
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(null); // 에러 상태

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
                setSellerStatus(response.data); // 필요하면 전체 데이터 저장

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

    // 뒤로가기 핸들러
    const handleGoBack = () => {
        navigate('/seller/status');
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    // sellerStatus가 로드되었지만, 위 useEffect에서 리다이렉트되지 않았다면
    // 이제 양식 자체는 표시 가능
    // (실제로 양식은 아래 TODO 부분에 구현될 예정)
    if (
        !sellerStatus ||
        (sellerStatus.approvalStatus !== null &&
            sellerStatus.approvalStatus !== 'REJECTED' &&
            sellerStatus.approvalStatus !== 'WITHDRAWN' &&
            sellerStatus.approvalStatus !== 'REVOKED')
    ) {
        // 이미 위 useEffect에서 처리되었겠지만, 만약을 위한 추가 방어 로직.
        // 이 부분은 실제 양식이 복잡해지면 필요할 수 있으나 현재는 위에 useEffect로 충분.
        return (
            <ErrorMessage message="판매자 권한 신청/재신청이 불가능한 상태입니다." />
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
            {/* 여기에 판매자 권한 신청 폼을 구현 예정 */}
            <div className="border border-gray-700 p-4 rounded-lg bg-[#1a232f]">
                <p className="text-gray-400">
                    이곳에 판매자 권한 신청 양식이 구현될 예정입니다. (예:
                    회사명, 사업자 등록 번호, 담당자 정보, 사업자 등록증 파일
                    업로드 등)
                </p>
                <p className="text-gray-400 mt-2">
                    {`현재 로그인 유저의 \`approvalStatus\`가 'PENDING' 또는 'APPROVED'인 경우 이 페이지에 접근할 수 없습니다.`}
                </p>
            </div>
        </div>
    );
};

export default SellerApplyPage;
