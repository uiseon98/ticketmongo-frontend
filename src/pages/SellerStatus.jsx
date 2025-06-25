import React from "react";
import { Link } from 'react-router-dom'; // Link 컴포넌트 임포트

const SellerStatus = () => {
    return (
        <div
            className="relative flex size-full min-h-screen flex-col bg-[#111922] dark group/design-root overflow-x-hidden"
            style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
        >
            <div className="layout-container flex h-full grow flex-col">
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#243447] px-10 py-3">
                    <div className="flex items-center gap-4 text-white">
                        <div className="size-4">
                            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
                            </svg>
                        </div>
                        <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                            TicketSwap
                        </h2>
                    </div>
                    <div className="flex flex-1 justify-end gap-8">
                        <div className="flex items-center gap-9">
                            {/* a 태그 대신 Link 컴포넌트 사용 */}
                            <Link className="text-white text-sm font-medium leading-normal" to="/">
                                Home
                            </Link>
                            <Link className="text-white text-sm font-medium leading-normal" to="/search">
                                Search
                            </Link>
                            <Link className="text-white text-sm font-medium leading-normal" to="/my-events">
                                My Events
                            </Link>
                            <Link className="text-white text-sm font-medium leading-normal" to="/messages">
                                Messages
                            </Link>
                        </div>
                        <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 bg-[#243447] text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
                            {/* data-icon 및 size/weight 속성 제거 (tailwind 또는 css로 처리) */}
                            <div className="text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                                    <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z" />
                                </svg>
                            </div>
                        </button>
                        {/* style 속성 제거 (tailwind 또는 css로 처리) */}
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                             style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAy-m4oO3Z4AMA__J26FIthP5D54YdkH9YxVc0uO009XlaKpU9TpVh-exx1XmtcYfsr8wtve362VlcIf6IhXXqdjcIYiyKMKLBMN9EnUTsHJkT94ywYdaGrqR7tsdMrqUg8WJGmSRhopPj-IvbeFuDJ7Kif3xnFUjF1WilDbcR1ZO7-tQD5LV0SfCsTO-1d4iB_q1eZ6kxDWCNLzNbO3bZFau-Xj0Aik1UvBVZerXTLRcdZHcvPUpgtO3QsE3dD6go-Z8MPZGla_zE")', }}
                        ></div>
                    </div>
                </header>

                <div className="px-40 flex flex-1 justify-center py-5">
                    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
                        <div className="flex flex-wrap justify-between gap-3 p-4">
                            <div className="flex min-w-72 flex-col gap-3">
                                <p className="text-white tracking-light text-[32px] font-bold leading-tight">
                                    Seller Status
                                </p>
                                <p className="text-[#93acc8] text-sm font-normal leading-normal">
                                    Manage your seller status and applications.
                                </p>
                            </div>
                        </div>

                        <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
                            Current Role
                        </h3>
                        <div className="flex items-center gap-4 bg-[#111922] px-4 min-h-[72px] py-2">
                            {/* data-icon 제거 */}
                            <div className="text-white flex items-center justify-center rounded-lg bg-[#243447] shrink-0 size-12">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                                    <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z" />
                                </svg>
                            </div>
                            <div className="flex flex-col justify-center">
                                <p className="text-white text-base font-medium leading-normal line-clamp-1">Seller</p>
                                <p className="text-[#93acc8] text-sm font-normal leading-normal line-clamp-2">Approved</p>
                            </div>
                        </div>

                        <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
                            Application Status
                        </h3>
                        <div className="flex gap-4 bg-[#111922] px-4 py-3">
                            {/* data-icon 제거 */}
                            <div className="text-white flex items-center justify-center rounded-lg bg-[#243447] shrink-0 size-12">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                                    <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
                                </svg>
                            </div>
                            <div className="flex flex-1 flex-col justify-center">
                                <p className="text-white text-base font-medium leading-normal">Seller Application</p>
                                <p className="text-[#93acc8] text-sm font-normal leading-normal">
                                    Application Date: 2025-01-15 Last Processed Date: 2025-01-20
                                </p>
                                <p className="text-[#93acc8] text-sm font-normal leading-normal">Approved</p>
                            </div>
                        </div>

                        <div className="flex justify-stretch">
                            <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-start">
                                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#243447] text-white text-sm font-bold leading-normal tracking-[0.015em]">
                                    <span className="truncate">Withdraw Application</span>
                                </button>
                                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#1978e5] text-white text-sm font-bold leading-normal tracking-[0.015em]">
                                    <span className="truncate">Reapply</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerStatus;
