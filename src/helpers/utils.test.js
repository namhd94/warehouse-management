import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn helper function', () => {
  it('combines classes correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('handles conditional classes', () => {
    const isError = false;
    const isSuccess = true;
    expect(cn('bg-red-500', isError && 'text-white', isSuccess && 'p-4')).toBe('bg-red-500 p-4');
  });

  it('merges tailwind classes properly', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});
