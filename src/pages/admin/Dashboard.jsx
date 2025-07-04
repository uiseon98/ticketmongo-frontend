// src/pages/admin/Dashboard.jsx

import React from 'react';

const AdminDashboard = () => {
    return (
        <div className="p-6 bg-[#111922] text-white min-h-[calc(100vh-64px)]">
            {/* Dashboard 제목 섹션 */}
            <div className="p-4 flex flex-row gap-y-3 items-start justify-between flex-wrap content-start self-stretch shrink-0 relative">
                <div className="flex flex-col gap-0 items-start justify-start shrink-0 w-72 min-w-[288px] relative">
                    <div className="text-[#ffffff] text-left font-['Inter-Bold',_sans-serif] text-[32px] leading-10 font-bold relative self-stretch">
                        Dashboard{' '}
                    </div>
                </div>
            </div>

            {/* 요약 카드 섹션 */}
            <div className="p-4 flex flex-row gap-4 items-start justify-start flex-wrap content-start self-stretch shrink-0 relative">
                {/* Pending Seller Applications 카드 */}
                <div className="rounded-lg border-solid border-[#334a66] border p-6 flex flex-col gap-2 items-start justify-start flex-1 min-w-[158px] relative">
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#ffffff] text-left font-['Inter-Medium',_sans-serif] text-base leading-6 font-medium relative self-stretch">
                            Pending Seller Applications{' '}
                        </div>
                        {/* 이미지 태그 추가 */}
                        <img
                            src="/admin-vector-03.svg" // 판매자/승인 관련 아이콘
                            alt="Pending Applications Icon"
                            className="w-6 h-6 mt-2"
                        />
                    </div>
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#ffffff] text-left font-['Inter-Bold',_sans-serif] text-2xl leading-[30px] font-bold relative self-stretch">
                            15{' '}
                        </div>
                    </div>
                </div>
                {/* Current Sellers 카드 */}
                <div className="rounded-lg border-solid border-[#334a66] border p-6 flex flex-col gap-2 items-start justify-start flex-1 min-w-[158px] relative">
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#ffffff] text-left font-['Inter-Medium',_sans-serif] text-base leading-6 font-medium relative self-stretch">
                            Current Sellers{' '}
                        </div>
                        {/* 이미지 태그 추가 */}
                        <img
                            src="/admin-vector-00.svg" // 대시보드/홈 아이콘, 전체 현황 의미
                            alt="Current Sellers Icon"
                            className="w-6 h-6 mt-2"
                        />
                    </div>
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#ffffff] text-left font-['Inter-Bold',_sans-serif] text-2xl leading-[30px] font-bold relative self-stretch">
                            250{' '}
                        </div>
                    </div>
                </div>
                {/* Recent Activities 카드 */}
                <div className="rounded-lg border-solid border-[#334a66] border p-6 flex flex-col gap-2 items-start justify-start flex-1 min-w-[158px] relative">
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#ffffff] text-left font-['Inter-Medium',_sans-serif] text-base leading-6 font-medium relative self-stretch">
                            Recent Activities{' '}
                        </div>
                        {/* 이미지 태그 추가 */}
                        <img
                            src="/admin-vector-01.svg" // 활동/통계 아이콘
                            alt="Recent Activities Icon"
                            className="w-6 h-6 mt-2"
                        />
                    </div>
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#ffffff] text-left font-['Inter-Bold',_sans-serif] text-2xl leading-[30px] font-bold relative self-stretch">
                            120{' '}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions 섹션 */}
            <div className="pt-5 pr-4 pb-3 pl-4 flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                <div className="text-[#ffffff] text-left font-['Inter-Bold',_sans-serif] text-[22px] leading-7 font-bold relative self-stretch">
                    Quick Actions{' '}
                </div>
            </div>
            <div className="flex flex-row items-start justify-between self-stretch shrink-0 relative">
                <div className="pt-3 pr-4 pb-3 pl-4 flex flex-row gap-3 items-start justify-start flex-wrap content-start flex-1 relative">
                    <div className="bg-[#1a78e5] rounded-lg pr-4 pl-4 flex flex-row gap-0 items-center justify-center shrink-0 h-10 min-w-[84px] max-w-[480px] relative overflow-hidden">
                        <div className="flex flex-col gap-0 items-center justify-start shrink-0 relative overflow-hidden">
                            <div
                                className="text-[#ffffff] text-center font-['Inter-Bold',_sans-serif] text-sm leading-[21px] font-bold relative self-stretch overflow-hidden"
                                style={{
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Approve/Reject Sellers{' '}
                            </div>
                        </div>
                    </div>
                    <div className="bg-[#243347] rounded-lg pr-4 pl-4 flex flex-row gap-0 items-center justify-center shrink-0 h-10 min-w-[84px] max-w-[480px] relative overflow-hidden">
                        <div className="flex flex-col gap-0 items-center justify-start shrink-0 relative overflow-hidden">
                            <div
                                className="text-[#ffffff] text-center font-['Inter-Bold',_sans-serif] text-sm leading-[21px] font-bold relative self-stretch overflow-hidden"
                                style={{
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Manage Sellers{' '}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activities 테이블 섹션 */}
            <div className="pt-5 pr-4 pb-3 pl-4 flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                <div className="text-[#ffffff] text-left font-['Inter-Bold',_sans-serif] text-[22px] leading-7 font-bold relative self-stretch">
                    Recent Activities{' '}
                </div>
            </div>
            <div className="pt-3 pr-4 pb-3 pl-4 flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                <div className="bg-[#121a21] rounded-lg border-solid border-[#334a66] border flex flex-row gap-0 items-start justify-start self-stretch shrink-0 relative overflow-hidden">
                    <div className="flex flex-col gap-0 items-start justify-start flex-1 relative">
                        <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                            <div className="bg-[#1a2633] flex flex-row gap-0 items-start justify-start self-stretch flex-1 relative">
                                <div className="pt-3 pr-4 pb-3 pl-4 flex flex-col gap-0 items-start justify-start self-stretch shrink-0 w-[286px] relative">
                                    <div className="text-[#ffffff] text-left font-['Inter-Medium',_sans-serif] text-sm leading-[21px] font-medium relative self-stretch">
                                        Seller{' '}
                                    </div>
                                </div>
                                <div className="pt-3 pr-4 pb-3 pl-4 flex flex-col gap-0 items-start justify-start self-stretch shrink-0 w-[294px] relative">
                                    <div className="text-[#ffffff] text-left font-['Inter-Medium',_sans-serif] text-sm leading-[21px] font-medium relative self-stretch">
                                        Action{' '}
                                    </div>
                                </div>
                                <div className="pt-3 pr-4 pb-3 pl-4 flex flex-col gap-0 items-start justify-start self-stretch shrink-0 w-[294px] relative">
                                    <div className="text-[#ffffff] text-left font-['Inter-Medium',_sans-serif] text-sm leading-[21px] font-medium relative self-stretch">
                                        Timestamp{' '}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* 테이블 데이터는 실제 데이터 연동 시 채워집니다. */}
                        <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                            <div className="border-solid border-[#e5e8eb] border-t flex flex-row gap-0 items-start justify-start self-stretch shrink-0 h-[72px] relative">
                                <div className="pt-2 pr-4 pb-2 pl-4 flex flex-col gap-0 items-center justify-center shrink-0 w-[286px] h-[72px] relative">
                                    <div className="text-[#ffffff] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                        Olivia Bennett{' '}
                                    </div>
                                </div>
                                <div className="pt-2 pr-4 pb-2 pl-4 flex flex-col gap-0 items-center justify-center shrink-0 w-[294px] h-[72px] relative">
                                    <div className="text-[#94abc7] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                        Submitted Application{' '}
                                    </div>
                                </div>
                                <div className="pt-2 pr-4 pb-2 pl-4 flex flex-col gap-0 items-center justify-center shrink-0 w-[294px] h-[72px] relative">
                                    <div className="text-[#94abc7] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                        2024-01-15 10:00 AM{' '}
                                    </div>
                                </div>
                            </div>
                            <div className="border-solid border-[#e5e8eb] border-t flex flex-row gap-0 items-start justify-start self-stretch shrink-0 h-[72px] relative">
                                <div className="pt-2 pr-4 pb-2 pl-4 flex flex-col gap-0 items-center justify-center shrink-0 w-[286px] h-[72px] relative">
                                    <div className="text-[#ffffff] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                        Ethan Carter{' '}
                                    </div>
                                </div>
                                <div className="pt-2 pr-4 pb-2 pl-4 flex flex-col gap-0 items-center justify-center shrink-0 w-[294px] h-[72px] relative">
                                    <div className="text-[#94abc7] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                        Approved{' '}
                                    </div>
                                </div>
                                <div className="pt-2 pr-4 pb-2 pl-4 flex flex-col gap-0 items-center justify-center shrink-0 w-[294px] h-[72px] relative">
                                    <div className="text-[#94abc7] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                        2024-01-14 03:30 PM{' '}
                                    </div>
                                </div>
                            </div>
                            <div className="border-solid border-[#e5e8eb] border-t flex flex-row gap-0 items-start justify-start self-stretch shrink-0 h-[72px] relative">
                                <div className="pt-2 pr-4 pb-2 pl-4 flex flex-col gap-0 items-center justify-center shrink-0 w-[286px] h-[72px] relative">
                                    <div className="text-[#ffffff] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                        Sophia Davis{' '}
                                    </div>
                                </div>
                                <div className="pt-2 pr-4 pb-2 pl-4 flex flex-col gap-0 items-center justify-center shrink-0 w-[294px] h-[72px] relative">
                                    <div className="text-[#94abc7] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                        Rejected{' '}
                                    </div>
                                </div>
                                <div className="pt-2 pr-4 pb-2 pl-4 flex flex-col gap-0 items-center justify-center shrink-0 w-[294px] h-[72px] relative">
                                    <div className="text-[#94abc7] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                        2024-01-13 09:15 AM{' '}
                                    </div>
                                </div>
                            </div>
                            <div className="border-solid border-[#e5e8eb] border-t flex flex-row gap-0 items-start justify-start self-stretch shrink-0 h-[72px] relative">
                                <div className="pt-2 pr-4 pb-2 pl-4 flex flex-col gap-0 items-center justify-center shrink-0 w-[286px] h-[72px] relative">
                                    <div className="text-[#ffffff] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                        Liam Foster{' '}
                                    </div>
                                </div>
                                <div className="pt-2 pr-4 pb-2 pl-4 flex flex-col gap-0 items-center justify-center shrink-0 w-[294px] h-[72px] relative">
                                    <div className="text-[#94abc7] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                        Updated Profile{' '}
                                    </div>
                                </div>
                                <div className="pt-2 pr-4 pb-2 pl-4 flex flex-col gap-0 items-center justify-center shrink-0 w-[294px] h-[72px] relative">
                                    <div className="text-[#94abc7] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                        2024-01-12 05:45 PM{' '}
                                    </div>
                                </div>
                            </div>
                            <div className="border-solid border-[#e5e8eb] border-t flex flex-row gap-0 items-start justify-start self-stretch shrink-0 h-[72px] relative">
                                <div className="pt-2 pr-4 pb-2 pl-4 flex flex-col gap-0 items-center justify-center shrink-0 w-[286px] h-[72px] relative">
                                    <div className="text-[#ffffff] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                        Ava Green{' '}
                                    </div>
                                </div>
                                <div className="pt-2 pr-4 pb-2 pl-4 flex flex-col gap-0 items-center justify-center shrink-0 w-[294px] h-[72px] relative">
                                    <div className="text-[#94abc7] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                        Submitted Application{' '}
                                    </div>
                                </div>
                                <div className="pt-2 pr-4 pb-2 pl-4 flex flex-col gap-0 items-center justify-center shrink-0 w-[294px] h-[72px] relative">
                                    <div className="text-[#94abc7] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                        2024-01-11 11:20 AM{' '}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
