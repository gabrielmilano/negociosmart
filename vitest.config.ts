/// <reference types="vitest" />
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['./src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    env: {
      VITE_SUPABASE_URL: 'https://aoglebzragcvhtbacspm.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZ2xlYnpyYWdjdmh0YmFjc3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwODc5ODMsImV4cCI6MjA3MjY2Mzk4M30.39a0tNiQ2rQYYRlewKOkMuQsfj9sWcZpCrxuQHh9kAE',
      SUPABASE_SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZ2xlYnpyYWdjdmh0YmFjc3BtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwNTM4ODA4NSwiZXhwIjoyMDIwOTY0MDg1fQ.rl_NneGVDEO1P6QMo8CQvFUHPA6fmqcvXf46EW58WI0'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})