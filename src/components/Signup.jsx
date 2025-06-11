import React, { useState } from 'react';
import authService from '../appwrite/auth';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../store/authSlice';
import { Button, Input, Logo } from './index.js';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';

function Signup() {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const dispatch = useDispatch();
    const { register, handleSubmit } = useForm();

    const create = async (data) => {
        setError('');
        try {
            const userData = await authService.createAccount(data);
            if (userData) {
                const currentUser = await authService.getCurrentUser();
                if (currentUser) dispatch(login(currentUser));
                navigate('/');
            }
        } catch (error) {
            setError(error.message || 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 md:p-10 border border-gray-200">
                <div className="flex justify-center mb-6">
                    <span className="inline-block w-40">
                       <div
      className="font-mono font-extrabold  text-black text-xl md:text-3xl px-4 py-2  rounded-xl shadow-sm backdrop-blur-sm">
      Edu<span className="text-blue-300">Share</span>
    </div>
                    </span>
                </div>
                <h2 className="text-center text-3xl font-bold text-gray-800">
                    Sign up to create account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                        Sign In
                    </Link>
                </p>

                {error && (
                    <p className="text-red-500 text-sm mt-6 text-center">{error}</p>
                )}

                <form onSubmit={handleSubmit(create)} className="mt-6 space-y-5">
                    <Input
                        label="Full Name"
                        placeholder="Enter your full name"
                        {...register('name', { required: 'Name is required' })}
                    />
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
                        {...register('password', { required: 'Password is required' })}
                    />
                    <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-full transition duration-200"
                    >
                        Create Account
                    </Button>
                </form>
            </div>
        </div>
    );
}

export default Signup;
