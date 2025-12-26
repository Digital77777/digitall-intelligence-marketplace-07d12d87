import { z } from 'zod';

// Contact and consultation validation
export const consultationSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  company: z.string()
    .trim()
    .max(200, 'Company name must be less than 200 characters')
    .optional(),
  phone: z.string()
    .trim()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number')
    .max(20, 'Phone number must be less than 20 characters')
    .optional(),
  consultationType: z.string()
    .min(1, 'Please select a consultation type'),
  preferredDate: z.string()
    .min(1, 'Please select a preferred date'),
  preferredTime: z.string()
    .min(1, 'Please select a preferred time'),
  alternativeDate: z.string().optional(),
  alternativeTime: z.string().optional(),
  meetingType: z.string()
    .min(1, 'Please select a meeting type'),
  topics: z.string()
    .trim()
    .max(1000, 'Topics must be less than 1000 characters')
    .optional(),
  goals: z.string()
    .trim()
    .max(1000, 'Goals must be less than 1000 characters')
    .optional(),
});

// Quote request validation
export const quoteRequestSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  company: z.string()
    .trim()
    .max(200, 'Company name must be less than 200 characters')
    .optional(),
  phone: z.string()
    .trim()
    .regex(/^[\d\s\-\+\(\)]+$/, 'Please enter a valid phone number')
    .max(20, 'Phone number must be less than 20 characters')
    .optional(),
  projectDescription: z.string()
    .trim()
    .min(10, 'Please provide at least 10 characters describing your project')
    .max(2000, 'Project description must be less than 2000 characters'),
  timeline: z.string()
    .max(100, 'Timeline must be less than 100 characters')
    .optional(),
  budget: z.string()
    .max(100, 'Budget must be less than 100 characters')
    .optional(),
  requirements: z.string()
    .trim()
    .max(2000, 'Requirements must be less than 2000 characters')
    .optional(),
});

// Auth validation for sign in
export const authSchema = z.object({
  email: z.string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email is too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});

// Sign up validation with full name
export const signUpSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),
  email: z.string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email is too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});
