/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { createReactAdapter } from '../../src/hooks/adapters/createReactAdapter.js'
import { createLoginEngine } from '@terence/core/engines/login/index.js'

// Mock React
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useSyncExternalStore: vi.fn((subscribe, getSnapshot) => {
      const [, forceUpdate] = React.useState({})
      React.useEffect(() => {
        const unsubscribe = subscribe(() => {
          forceUpdate({})
        })
        return unsubscribe
      }, [subscribe])
      return getSnapshot()
    }),
  }
})

describe('createReactAdapter', () => {
  it('should create a hook that subscribes to engine state changes', () => {
    const mockDeps = {
      loginRequest: vi.fn().mockResolvedValue({ token: 'test' }),
      saveToken: vi.fn(),
      clearToken: vi.fn(),
      navigate: vi.fn(),
    }

    const engine = createLoginEngine(mockDeps)
    const useLogin = createReactAdapter(engine)

    const { result } = renderHook(() => useLogin())

    expect(result.current).toBeDefined()
    expect(result.current.state).toBeDefined()
    expect(result.current.commands).toBeDefined()
    expect(result.current.rules).toBeDefined()
  })

  it('should return engine state', () => {
    const mockDeps = {
      loginRequest: vi.fn().mockResolvedValue({ token: 'test' }),
      saveToken: vi.fn(),
      clearToken: vi.fn(),
      navigate: vi.fn(),
    }

    const engine = createLoginEngine(mockDeps)
    const useLogin = createReactAdapter(engine)

    const { result } = renderHook(() => useLogin())

    expect(result.current.state.username).toBe('')
    expect(result.current.state.status).toBe('idle')
  })

  it('should return engine commands', () => {
    const mockDeps = {
      loginRequest: vi.fn().mockResolvedValue({ token: 'test' }),
      saveToken: vi.fn(),
      clearToken: vi.fn(),
      navigate: vi.fn(),
    }

    const engine = createLoginEngine(mockDeps)
    const useLogin = createReactAdapter(engine)

    const { result } = renderHook(() => useLogin())

    expect(typeof result.current.commands.setUsername).toBe('function')
    expect(typeof result.current.commands.setPassword).toBe('function')
    expect(typeof result.current.commands.submit).toBe('function')
  })

  it('should return engine rules', () => {
    const mockDeps = {
      loginRequest: vi.fn().mockResolvedValue({ token: 'test' }),
      saveToken: vi.fn(),
      clearToken: vi.fn(),
      navigate: vi.fn(),
    }

    const engine = createLoginEngine(mockDeps)
    const useLogin = createReactAdapter(engine)

    const { result } = renderHook(() => useLogin())

    expect(typeof result.current.rules.canSubmit).toBe('function')
    expect(typeof result.current.rules.isAuthenticated).toBe('function')
  })

  it('should update component when engine state changes', async () => {
    const mockDeps = {
      loginRequest: vi.fn().mockResolvedValue({ token: 'test' }),
      saveToken: vi.fn(),
      clearToken: vi.fn(),
      navigate: vi.fn(),
    }

    const engine = createLoginEngine(mockDeps)
    const useLogin = createReactAdapter(engine)

    const { result } = renderHook(() => useLogin())

    act(() => {
      result.current.commands.setUsername('testuser')
    })

    expect(result.current.state.username).toBe('testuser')
  })
})
