export function EditProfileForm({ icon: Icon, type = 'text', name, value, labelName, error, onChange, disabled }) {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-2 text-left">
                {labelName}
            </label>
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    id={name}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className="w-full pl-10 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>
            {error && <p className="text-red-400 text-xs mt-1 text-left">{error}</p>}
        </div>
    );
}
