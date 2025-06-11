import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as authLogin } from '../store/authSlice';
import { Button, Input, Logo } from './index';
import { useDispatch } from 'react-redux';
import authService from '../appwrite/auth';
import { useForm } from 'react-hook-form';

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { register, handleSubmit } = useForm();
    const [error, setError] = useState('');

    const login = async (data) => {
        setError('');
        try {
            const session = await authService.login(data);
            if (session) {
                const userData = await authService.getCurrentUser();
                if (userData) dispatch(authLogin(userData));
                navigate('/');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 md:p-10 border border-gray-200">
                <div className="flex justify-center mb-6">
                    <span className="inline-block w-40">
                       <div
      className="font-mono font-extrabold  text-black text-xl md:text-3xl px-4 py-2  rounded-xl shadow-sm backdrop-blur-sm">
      Edu<span className="text-blue-300">Share</span>
    </div>
                    </span>
                </div>
                <h2 className="text-center text-3xl font-bold text-gray-800">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-500">
                    Don&apos;t have an account?{' '}
                    <Link
                        to="/signup"
                        className="text-blue-600 hover:underline font-medium"
                    >
                        Sign up
                    </Link>
                </p>

                {error && (
                    <p className="text-red-500 text-sm mt-6 text-center">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit(login)} className="mt-6 space-y-5">
                    <Input
                        label="Email"
                        placeholder="Enter your email"
                        type="email"
                        {...register('email', {
                            required: 'Email is required',
                            validate: {
                                matchPattern: (value) =>
                                    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                                    'Invalid email address',
                            },
                        })}
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        {...register('password', {
                            required: 'Password is required',
                        })}
                    />
                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full transition duration-200"
                    >
                        Sign in
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default Login;
