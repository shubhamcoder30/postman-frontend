import { useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { authApi } from '../api/auth';
import { Lock, ShieldCheck, Zap } from 'lucide-react';
import InputField from '../components/InputField';
import toast from 'react-hot-toast';

const validationSchema = Yup.object({
    otp: Yup.string()
        .required('OTP is required')
        .length(6, 'OTP must be 6 characters'),
    newPassword: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('New Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Please confirm your password'),
});

const VerifyOtp = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const formik = useFormik({
        initialValues: {
            otp: '',
            newPassword: '',
            confirmPassword: '',
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, setFieldError }) => {
            if (!email) {
                toast.error('Email missing. Please try again from forgot password.');
                navigate('/forgot-password');
                return;
            }

            try {
                await authApi.resetPassword(email, values.otp, values.newPassword);
                toast.success('Password reset successfully! Please login.');
                navigate('/login');
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || 'Failed to verify OTP. Please try again.';
                setFieldError('otp', errorMessage);
                toast.error(errorMessage);
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center mesh-gradient p-6">
            <div className="w-full max-w-[440px]">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-xl shadow-blue-500/20 mb-6 animate-in zoom-in duration-500">
                        <ShieldCheck className="text-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Verify Account</h1>
                    <p className="text-slate-500 font-medium text-sm px-4">Enter the code sent to {email || 'your email'} and set your new password</p>
                </div>

                <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <form onSubmit={formik.handleSubmit} className="space-y-5">
                        <InputField
                            label="OTP Code"
                            name="otp"
                            type="text"
                            placeholder="123456"
                            icon={Zap}
                            value={formik.values.otp}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.errors.otp}
                            touched={formik.touched.otp}
                            required
                        />

                        <InputField
                            label="New Password"
                            name="newPassword"
                            type="password"
                            placeholder="••••••••"
                            icon={Lock}
                            value={formik.values.newPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.errors.newPassword}
                            touched={formik.touched.newPassword}
                            required
                        />

                        <InputField
                            label="Confirm New Password"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            icon={Lock}
                            value={formik.values.confirmPassword}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.errors.confirmPassword}
                            touched={formik.touched.confirmPassword}
                            required
                        />

                        <button
                            type="submit"
                            disabled={formik.isSubmitting || !formik.isValid}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-4"
                        >
                            {formik.isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Verifying...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2 text-sm uppercase tracking-widest">
                                    Reset Password
                                </span>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-10 text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">
                    &copy; 2026 Postman Clone &bull; Premium API Testing
                </p>
            </div>
        </div>
    );
};

export default VerifyOtp;
