import { describe, expect, it } from 'vitest';
import { manageError } from './errors';

describe('manageError', () => {
  it('returns unauthorized marker for 401 when logout is requested', async () => {
    const response = { status: 401, json: () => Promise.resolve({ message: 'expired' }) };
    const result = await manageError(response, { logoutOnUnauthorized: true });
    expect(result).toEqual({ unauthorized: true });
  });

  it('returns the API message for 401 on login requests', async () => {
    const response = { status: 401, json: () => Promise.resolve({ message: 'Invalid credentials' }) };
    const result = await manageError(response);
    expect(result).toBe('Invalid credentials');
  });
});
