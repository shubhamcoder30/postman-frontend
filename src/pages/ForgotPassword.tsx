import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { KeyRound, ArrowLeft } from 'lucide-react';

import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authApi.forgotPassword(email);
            toast.success('OTP sent to your email');
            navigate('/verify-otp', { state: { email } });
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Failed to send reset email. Please try again.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-2xl border border-gray-700">
                <div className="flex items-center justify-center mb-8">
                    <KeyRound className="text-purple-500 mr-3" size={32} />
                    <h1 className="text-3xl font-bold text-white">Forgot Password</h1>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="you@example.com"
                        />
                        <p className="mt-2 text-xs text-gray-400">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center text-sm text-gray-400 hover:text-gray-300 transition-colors"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
