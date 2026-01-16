import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { authApi } from '../api/auth';
import { LogIn } from 'lucide-react';
import InputField from '../components/InputField';

const validationSchema = Yup.object({
    email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
    password: Yup.string()
        .required('Password is required'),
});

import toast from 'react-hot-toast';

const Login = () => {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, setFieldError }) => {
            try {
                const response = await authApi.login(values);

                // Store token
                localStorage.setItem('authToken', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));

                toast.success('Welcome back!');
                // Redirect to main app
                navigate('/');
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
                setFieldError('password', errorMessage);
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
                    <LogIn className="text-blue-500 mr-3" size={32} />
                    <h1 className="text-3xl font-bold text-white">Login</h1>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <InputField
                        label="Email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
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
                        placeholder="••••••••"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.errors.password}
                        touched={formik.touched.password}
                        required
                    />

                    <div className="flex items-center justify-between text-sm">
                        <Link
                            to="/forgot-password"
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={formik.isSubmitting || !formik.isValid}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {formik.isSubmitting ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
