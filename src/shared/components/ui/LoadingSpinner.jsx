import React from 'react';

const LoadingSpinner = ({
    size = 10,
    color = 'text-blue-500',
    message = '로딩 중...',
}) => {
    const spinnerSizeClass = `w-${size} h-${size}`;

    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-[#111922] text-white p-4">
            <div
                className={`animate-spin rounded-full border-t-2 border-b-2 ${color} ${spinnerSizeClass}`}
                style={{ borderColor: color.replace('text-', '') }} // Tailwind 색상 클래스에서 실제 색상 추출 시도 (완벽하진 않음)
            ></div>
            <p className="mt-4 text-lg text-gray-400">{message}</p>
        </div>
    );
};

export default LoadingSpinner;
