// 관리자 대시보드
import React from 'react';

const AdminDashboard = () => {
    return (
        <div className="p-6 bg-[#111922] text-white min-h-[calc(100vh-64px)]">
            <h2 className="text-3xl font-bold mb-4">관리자 대시보드</h2>
            <p>
                환영합니다! 관리자 페이지입니다. 이곳에서 다양한 시스템 관리를
                수행할 수 있습니다.
            </p>
            {/* 관리자 대시보드 콘텐츠를 여기에 구현 */}
            <div className="mt-8 p-4 border border-gray-700 rounded-lg bg-[#1a232f]">
                <p className="text-gray-400">
                    이곳에 시스템 상태 요약, 최신 판매자 신청 목록, 콘서트 통계
                    등 관리자 전용 대시보드 콘텐츠가 표시됩니다.
                </p>
            </div>
        </div>
    );
};

export default AdminDashboard;
