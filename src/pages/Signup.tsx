import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { authApi } from '../api/auth';
import { Mail, Lock, Zap, ArrowRight } from 'lucide-react';
import InputField from '../components/InputField';
import toast from 'react-hot-toast';

const validationSchema = Yup.object({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
});

const Signup = () => {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
            confirmPassword: '',
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, setFieldError }) => {
            try {
                const response = await authApi.signup({
                    email: values.email,
                    password: values.password,
                });
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                toast.success('Account created successfully!');
                navigate('/');
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || 'Signup failed. Please try again.';
                setFieldError('email', errorMessage);
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
                        <Zap className="text-white fill-white" size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Join the Platform</h1>
                    <p className="text-slate-500 font-medium">Create your account to start testing APIs</p>
                </div>

                <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <form onSubmit={formik.handleSubmit} className="space-y-5">
                        <InputField
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="name@company.com"
                            icon={Mail}
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.errors.email}
                            touched={formik.touched.email}
                            required
                        />

                        <InputField
                            label="Password"
                            name="password"
                            type="password"
                            placeholder="Min. 6 characters"
                            icon={Lock}
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.errors.password}
                            touched={formik.touched.password}
                            required
                        />

                        <InputField
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            placeholder="Repeat your password"
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
                                    Creating Account...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Create Account <ArrowRight size={18} />
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                        <p className="text-slate-500 text-sm font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-center mt-10 text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">
                    &copy; 2026 Postman Clone &bull; Premium API Testing
                </p>
            </div>
        </div>
    );
};

export default Signup;
