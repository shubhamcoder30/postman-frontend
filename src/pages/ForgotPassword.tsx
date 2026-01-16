import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { KeyRound, ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import InputField from '../components/InputField';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await authApi.forgotPassword(email);
            toast.success('OTP sent to your email');
            navigate('/verify-otp', { state: { email } });
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Failed to send reset email. Please try again.';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center mesh-gradient p-6">
            <div className="w-full max-w-[440px]">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-xl shadow-blue-500/20 mb-6 animate-in zoom-in duration-500">
                        <KeyRound className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Reset Password</h1>
                    <p className="text-slate-500 font-medium text-sm px-4">Enter your email and we'll send you an OTP to reset your password</p>
                </div>

                <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <InputField
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="name@company.com"
                            icon={Mail}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Sending OTP...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2 text-sm uppercase tracking-widest">
                                    Send Code
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
                        >
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Login
                        </Link>
                    </div>
                </div>

                <p className="text-center mt-10 text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">
                    &copy; 2024 Postman Clone &bull; Premium API Testing
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
