/**
 * Tests for logger utility
 */

import { describe, it, expect, vi } from 'vitest';
import { info, success, warn, error } from './logger.js';

describe('logger', () => {
  it('should log info message', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    info('test info');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should log success message', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    success('test success');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should log warning message', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warn('test warning');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should log error message', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    error('test error');
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
