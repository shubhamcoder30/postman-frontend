import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { authApi } from '../api/auth';
import { KeyRound } from 'lucide-react';
import InputField from '../components/InputField';

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

import toast from 'react-hot-toast';

const VerifyOtp = () => {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            otp: '',
            newPassword: '',
            confirmPassword: '',
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, setFieldError }) => {
            try {
                await authApi.resetPassword(values.otp, values.newPassword);

                toast.success('Password reset successfully! Please login.');
                // Redirect to login with success message (could use toast here)
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-2xl border border-gray-700">
                <div className="flex items-center justify-center mb-8">
                    <KeyRound className="text-yellow-500 mr-3" size={32} />
                    <h1 className="text-3xl font-bold text-white">Reset Password</h1>
                </div>

                <p className="text-gray-400 text-center mb-6">
                    Enter the OTP sent to your email and set a new password.
                    <br />
                </p>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <InputField
                        label="OTP"
                        name="otp"
                        type="text"
                        placeholder="123456"
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
                        className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {formik.isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyOtp;
