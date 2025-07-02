import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const SellerApplyPage = () => {
    const { user } = useContext(AuthContext); // user 정보 가져오기
    const navigate = useNavigate();

    useEffect(() => {
        // 로그인되지 않은 경우 (App.jsx에서 이미 처리되지만, 컴포넌트 자체 로직 강화)
        if (!user) {
            navigate('/unauthorized', { replace: true });
            return;
        }

        // 판매자 권한 신청이 불가능한 상태 (이미 신청 대기 중이거나 승인된 경우)에는 리다이렉트
        // (null, REJECTED, WITHDRAWN, REVOKED 상태일 때만 신청/재신청 가능)
        const currentApprovalStatus = user.approvalStatus;
        if (
            currentApprovalStatus === 'PENDING' ||
            currentApprovalStatus === 'APPROVED'
        ) {
            alert('현재 상태에서는 판매자 권한 신청/재신청을 할 수 없습니다.');
            navigate('/seller/status', { replace: true }); // 판매자 권한 상태 페이지로 리다이렉트
        }
    }, [user, navigate]);

    // 뒤로가기 핸들러
    const handleGoBack = () => {
        navigate('/seller/status'); // 판매자 권한 상태 페이지로 이동
    };

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
                    현재 로그인 유저의 `approvalStatus`가 'PENDING' 또는
                    'APPROVED'인 경우 이 페이지에 접근할 수 없습니다.
                </p>
            </div>
        </div>
    );
};

export default SellerApplyPage;
