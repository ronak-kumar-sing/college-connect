// lib/validations/auth.ts
import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),

  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),

  email: z.string()
    .email('Please enter a valid email address'),

  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number'),

  password: z.string()
    .min(6, 'Password must be at least 6 characters'),

  confirmPassword: z.string(),

  userType: z.enum(['student', 'faculty', 'other']),

  collegeRegistrationNo: z.string().optional(),
  college: z.string().optional(),
  department: z.string().optional(),
  year: z.number().min(1).max(5).optional(),
  designation: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if ((data.userType === 'student' || data.userType === 'faculty') && !data.collegeRegistrationNo) {
    return false;
  }
  return true;
}, {
  message: "College Registration Number is required for students and faculty",
  path: ["collegeRegistrationNo"],
});

export const loginSchema = z.object({
  login: z.string().min(1, 'Username or phone number is required'),
  password: z.string().min(1, 'Password is required')
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
