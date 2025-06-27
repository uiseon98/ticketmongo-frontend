import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

export default function Header() {
  const { user, logout, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // 공통 네비게이션 링크
  const commonLinks = [
    { to: '/', label: 'Home' },
    { to: '/concerts', label: 'Concerts' }
  ];

  // 사용자 상태별 추가 링크
  let extraLinks = [];
  if (!loading) {
    if (!user) {
      // 비로그인
      extraLinks = [
        { to: '/login', label: 'Login' },
        { to: '/register', label: 'Sign Up' }
      ];
    } else {
      // 일반 사용자
      extraLinks.push({ to: '/reservations', label: 'My Reservations' });
      // 판매자 권한
      if (
        user.role === 'seller' ||
        (user.roles && user.roles.includes('seller'))
      ) {
        extraLinks.push({ to: '/manage', label: 'Manage Concerts' });
      }
      // 관리자 권한
      if (
        user.role === 'admin' ||
        (user.roles && user.roles.includes('admin'))
      ) {
        extraLinks.push({ to: '/admin', label: 'Admin Dashboard' });
      }
      // 프로필
      extraLinks.push({ to: '/mypage/profile', label: 'Profile' });
    }
  }

  return (
    <header className="bg-gray-900 border-b border-gray-700 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <nav className="flex items-center space-x-6">
          {commonLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-gray-300 hover:text-white ${isActive ? 'underline' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {extraLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-gray-300 hover:text-white ${isActive ? 'underline' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          {loading ? (
            <div className="text-gray-400">Loading…</div>
          ) : user ? (
            <>
              <span className="text-gray-200">Hello, {user.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
