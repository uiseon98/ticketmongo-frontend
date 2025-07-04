import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import SellerConcertList from '../../features/seller/components/SellerConcertList.jsx';
import ConcertForm from '../../features/seller/components/ConcertForm.jsx';
import { AlertCircle } from 'lucide-react';

const SellerConcertManagementPage = () => {
    const { user } = useContext(AuthContext);

    // 모달 상태 관리
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedConcert, setSelectedConcert] = useState(null);

    // 판매자 ID
    const sellerId = user?.userId;

    // ====== 이벤트 핸들러들 ======

    // 콘서트 생성 모달 열기
    const handleCreateConcert = () => {
        setSelectedConcert(null);
        setShowCreateModal(true);
    };

    // 콘서트 수정 모달 열기
    const handleEditConcert = (concert) => {
        setSelectedConcert(concert);
        setShowEditModal(true);
    };

    // 콘서트 생성/수정 성공 시
    const handleConcertSuccess = (concert) => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedConcert(null);
        // SellerConcertList에서 자동으로 목록이 새로고침됨
    };

    // 모달 닫기
    const handleCloseModal = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedConcert(null);
    };

    // 로그인하지 않았거나 판매자가 아닌 경우 처리
    if (!user || !sellerId) {
        return (
            <div className="p-6 bg-[#111922] text-white">
                <h2 className="text-3xl font-bold mb-4">콘서트 관리</h2>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <AlertCircle
                            size={48}
                            className="mx-auto mb-4 text-red-400"
                        />
                        <h3 className="text-xl font-bold mb-2">
                            접근 권한이 없습니다
                        </h3>
                        <p className="mb-4 text-gray-300">
                            콘서트 관리는 로그인한 판매자만 가능합니다.
                        </p>
                        <button
                            onClick={() => (window.location.href = '/login')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            로그인하기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-[#111922] text-white">
            <h2 className="text-3xl font-bold mb-4">콘서트 관리</h2>
            <p className="mb-6 text-gray-300">
                등록된 콘서트 목록을 확인하고 관리하는 페이지입니다.
            </p>

            {/* 콘서트 목록 컴포넌트 */}
            <div className="bg-gray-800 rounded-lg border border-gray-600">
                <SellerConcertList
                    sellerId={sellerId}
                    onCreateConcert={handleCreateConcert}
                    onEditConcert={handleEditConcert}
                />
            </div>

            {/* 콘서트 생성 모달 */}
            {showCreateModal && (
                <ConcertForm
                    isOpen={showCreateModal}
                    onClose={handleCloseModal}
                    onSuccess={handleConcertSuccess}
                    concert={null} // 생성 모드
                    sellerId={sellerId}
                    modal={true}
                />
            )}

            {/* 콘서트 수정 모달 */}
            {showEditModal && selectedConcert && (
                <ConcertForm
                    isOpen={showEditModal}
                    onClose={handleCloseModal}
                    onSuccess={handleConcertSuccess}
                    concert={selectedConcert} // 수정 모드
                    sellerId={sellerId}
                    modal={true}
                />
            )}
        </div>
    );
};

export default SellerConcertManagementPage;
