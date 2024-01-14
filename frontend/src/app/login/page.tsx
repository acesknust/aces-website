'use client'
import { useState } from 'react';
import axiosInstance from '../../../api/axios';
import { Metadata } from 'next';
import { BsExclamationCircle } from 'react-icons/bs';
import { adminNavigate } from '../actions';

// export const metadata: Metadata = {
//   title: 'Admin Login',
//   };

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<null | string>(null);
  
  const handleLogin = async () => {
    setError(null);
    try {
      const response = await axiosInstance.post('/user/admin/login/', {
        email,
        password,
      });
      console.log(response.data);
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
  
      axiosInstance.defaults.headers['Authorization'] =
        'Bearer ' + localStorage.getItem('access_token');
        
      adminNavigate();
    } catch (error) {
      console.error('Login failed:', error);
      setError('Invalid email or password');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center w-96 h-96 bg-white rounded-lg shadow-sm">
        <h1 className="text-3xl font-semibold text-gray-800">Admin Login</h1>
        <div className="w-72 mt-4">
          <label className="text-sm font-semibold text-gray-600">Email</label>
          <input
            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="w-72 mt-4">
          <label className="text-sm font-semibold text-gray-600">Password</label>
          <input
            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        {error && (
          <div className="flex flex-row items-center justify-center w-72 mt-4">
            <BsExclamationCircle className="text-red-500" />
            <p className="ml-2 text-sm font-semibold text-red-500">{error}</p>
          </div>
        )}
        <button
          className="px-4 py-2 mt-4 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
          onClick={handleLogin}
          type='submit'
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
