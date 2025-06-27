import React, { useState } from 'react';
import { User, Lock, Calendar, Eye, EyeOff, Camera, Phone, Mail, MapPin, Edit2, Save, X } from 'lucide-react';

export function PasswordTab({ userId, onChangePassword }) {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isChanging, setIsChanging] = useState(false);
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: '',
    });

    const handlePasswordChange = async () => {
        if (passwords.new !== passwords.confirm) {
            alert('새 비밀번호가 일치하지 않습니다.');
            return;
        }

        if (passwords.new.length < 8) {
            alert('비밀번호는 8자 이상이어야 합니다.');
            return;
        }

        setIsChanging(true);
        try {
            await onChangePassword({
                userId,
                currentPassword: passwords.current,
                newPassword: passwords.new,
            });
            alert('비밀번호가 성공적으로 변경되었습니다.');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            alert('비밀번호 변경에 실패했습니다.');
        } finally {
            setIsChanging(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">비밀번호 변경</h3>
                <p className="text-gray-400">보안을 위해 주기적으로 비밀번호를 변경해주세요</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">현재 비밀번호</label>
                    <div className="relative">
                        <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={passwords.current}
                            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">새 비밀번호</label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={passwords.new}
                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">8자 이상 입력해주세요</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">새 비밀번호 확인</label>
                    <input
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                    />
                </div>

                <button
                    type="button"
                    onClick={handlePasswordChange}
                    disabled={isChanging || !passwords.current || !passwords.new || !passwords.confirm}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                    {isChanging ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>변경 중...</span>
                        </>
                    ) : (
                        <span>비밀번호 변경</span>
                    )}
                </button>
            </div>
        </div>
    );
}
