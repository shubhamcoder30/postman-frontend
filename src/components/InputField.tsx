import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputFieldProps {
    label: string;
    name: string;
    type?: 'text' | 'email' | 'password';
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    error?: string;
    touched?: boolean;
    required?: boolean;
}

const InputField = ({
    label,
    name,
    type = 'text',
    placeholder,
    value,
    onChange,
    onBlur,
    error,
    touched,
    required = false,
}: InputFieldProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    const hasError = touched && error;

    return (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-300">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
                <input
                    type={inputType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    className={`w-full px-4 py-2 bg-gray-700 border rounded-md text-white focus:outline-none focus:ring-2 transition-colors ${hasError
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-600 focus:ring-blue-500'
                        }`}
                    placeholder={placeholder}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                )}
            </div>
            {hasError && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                    {error}
                </p>
            )}
        </div>
    );
};

export default InputField;
