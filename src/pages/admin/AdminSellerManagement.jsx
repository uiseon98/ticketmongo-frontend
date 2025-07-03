import React from 'react';

const AdminSellerManagement = () => {
    return (
        <div className="p-6 bg-[#111922] text-white min-h-[calc(100vh-64px)]">
            <h2 className="text-3xl font-bold mb-4">
                관리자: 판매자 권한 관리
            </h2>
            <p>
                이곳에서 판매자 권한 신청을 승인하거나 반려하고, 기존 판매자
                권한을 강제 해제할 수 있습니다.
            </p>
            {/* 판매자 권한 관리 관련 UI 및 기능을 여기에 구현 예정 */}
            <div className="mt-8 p-4 border border-gray-700 rounded-lg bg-[#1a232f]">
                <p className="text-gray-400">
                    판매자 권한 신청 목록 조회, 상세 보기, 승인/반려 버튼, 강제
                    해제 기능 등이 구현될 예정입니다.
                </p>
            </div>
        </div>
    );
};

export default AdminSellerManagement;
