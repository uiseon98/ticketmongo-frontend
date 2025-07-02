import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import AdminSidebar from '../../../features/admin/components/AdminSidebar';

const AdminLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-[#0A0D11]">
            <Header /> {/* 전체 레이아웃에 헤더 포함 */}
            <div className="flex flex-1">
                <AdminSidebar /> {/* 관리자 사이드바 */}
                <main className="flex-1 p-0 overflow-y-auto">
                    <Outlet />{' '}
                    {/* 관리자 페이지의 하위 라우트들이 렌더링될 위치 */}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
