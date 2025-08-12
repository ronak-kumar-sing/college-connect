// app/register/page.tsx
'use client'
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const userType = watch('userType');

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      toast.success('Registration successful! Please login.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username *
              </label>
              <Input
                {...register('username')}
                type="text"
                placeholder="Enter username"
                className={errors.username ? 'border-red-500' : ''}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <Input
                {...register('name')}
                type="text"
                placeholder="Enter your full name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <Input
                {...register('email')}
                type="email"
                placeholder="Enter your email"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number *
              </label>
              <Input
                {...register('phone')}
                type="tel"
                placeholder="Enter 10-digit phone number"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* User Type */}
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                User Type *
              </label>
              <select
                {...register('userType')}
                className={`w-full h-10 rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.userType ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value="">Select user type</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="other">Other</option>
              </select>
              {errors.userType && (
                <p className="mt-1 text-sm text-red-600">{errors.userType.message}</p>
              )}
            </div>

            {/* College Registration No - Required for students and faculty */}
            {(userType === 'student' || userType === 'faculty') && (
              <div>
                <label htmlFor="collegeRegistrationNo" className="block text-sm font-medium text-gray-700">
                  College Registration Number *
                </label>
                <Input
                  {...register('collegeRegistrationNo')}
                  type="text"
                  placeholder="Enter college registration number"
                  className={errors.collegeRegistrationNo ? 'border-red-500' : ''}
                />
                {errors.collegeRegistrationNo && (
                  <p className="mt-1 text-sm text-red-600">{errors.collegeRegistrationNo.message}</p>
                )}
              </div>
            )}

            {/* College */}
            {(userType === 'student' || userType === 'faculty') && (
              <div>
                <label htmlFor="college" className="block text-sm font-medium text-gray-700">
                  College Name
                </label>
                <Input
                  {...register('college')}
                  type="text"
                  placeholder="Enter college name"
                />
              </div>
            )}

            {/* Department */}
            {(userType === 'student' || userType === 'faculty') && (
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                  Department
                </label>
                <Input
                  {...register('department')}
                  type="text"
                  placeholder="Enter department"
                />
              </div>
            )}

            {/* Year - Only for students */}
            {userType === 'student' && (
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                  Year of Study
                </label>
                <select
                  {...register('year', { valueAsNumber: true })}
                  className="w-full h-10 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select year</option>
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                  <option value={5}>5th Year</option>
                </select>
              </div>
            )}

            {/* Designation - Only for faculty */}
            {userType === 'faculty' && (
              <div>
                <label htmlFor="designation" className="block text-sm font-medium text-gray-700">
                  Designation
                </label>
                <Input
                  {...register('designation')}
                  type="text"
                  placeholder="e.g., Assistant Professor, Professor"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <Input
                {...register('password')}
                type="password"
                placeholder="Enter password (min 6 characters)"
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <Input
                {...register('confirmPassword')}
                type="password"
                placeholder="Confirm your password"
                className={errors.confirmPassword ? 'border-red-500' : ''}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
