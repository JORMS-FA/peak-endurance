import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

const { mockClient, mockLocation, configuredRef } = vi.hoisted(() => ({
  mockClient: { functions: { invoke: vi.fn() } },
  mockLocation: {
    href: 'https://test.peak-endurance.app/',
    assign: vi.fn(),
    replace: vi.fn(),
  } as unknown as Location,
  configuredRef: { value: true },
}))

vi.mock('@/lib/supabase', () => ({
  get supabase() {
    return configuredRef.value ? mockClient : null
  },
  supabaseConfigured: true,
}))

import { useStripe } from '../useStripe'

let locationSpy: ReturnType<typeof vi.spyOn>
let openSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  vi.clearAllMocks()
  configuredRef.value = true
  mockClient.functions.invoke.mockReset()
  // Reset the shared mock location href so leftover state from a previous
  // successful-redirect test does not leak into the next one.
  ;(mockLocation as { href: string }).href = 'https://test.peak-endurance.app/'
  locationSpy = vi.spyOn(window, 'location', 'get').mockReturnValue(mockLocation)
  openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
})

afterEach(() => {
  locationSpy.mockRestore()
  openSpy.mockRestore()
  vi.restoreAllMocks()
})

describe('useStripe (Lemon Squeezy)', () => {
  it('redirects to the checkout url on a successful checkout invocation', async () => {
    mockClient.functions.invoke.mockResolvedValue({
      data: { url: 'https://www.lemonsqueezy.com/checkout/123' },
      error: null,
    })
    const { result } = renderHook(() => useStripe())
    await act(async () => {
      await result.current.checkout('monthly')
    })
    expect(mockClient.functions.invoke).toHaveBeenCalledWith('lemonsqueezy-checkout', {
      body: {},
    })
    expect(window.location.href).toBe('https://www.lemonsqueezy.com/checkout/123')
    expect(result.current.error).toBeNull()
  })

  it('sets an error when the edge function returns an error (non-2xx)', async () => {
    mockClient.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: 'Edge Function returned non-2xx' },
    })
    const { result } = renderHook(() => useStripe())
    await act(async () => {
      await result.current.checkout('monthly')
    })
    expect(result.current.error).toBe('Edge Function returned non-2xx')
    expect(window.location.href).not.toContain('lemonsqueezy')
  })

  it('sets an error when no url is returned (e.g. Lemon Squeezy 404)', async () => {
    mockClient.functions.invoke.mockResolvedValue({
      data: { error: 'Failed to create checkout session' },
      error: null,
    })
    const { result } = renderHook(() => useStripe())
    await act(async () => {
      await result.current.checkout('monthly')
    })
    expect(result.current.error).toBe('Failed to create checkout session')
  })

  it('is a no-op (no invoke) when supabase is not configured', async () => {
    configuredRef.value = false
    const { result } = renderHook(() => useStripe())
    await act(async () => {
      await result.current.checkout('monthly')
    })
    expect(mockClient.functions.invoke).not.toHaveBeenCalled()
  })

  it('opens the customer portal in a new tab on success', async () => {
    mockClient.functions.invoke.mockResolvedValue({
      data: { url: 'https://portal.lemonsqueezy.com/manage' },
      error: null,
    })
    const { result } = renderHook(() => useStripe())
    await act(async () => {
      await result.current.openPortal()
    })
    expect(mockClient.functions.invoke).toHaveBeenCalledWith('lemonsqueezy-portal', { body: {} })
    expect(openSpy).toHaveBeenCalledWith('https://portal.lemonsqueezy.com/manage', '_blank')
    expect(result.current.error).toBeNull()
  })

  it('surfaces an error when the portal edge function fails', async () => {
    mockClient.functions.invoke.mockResolvedValue({
      data: null,
      error: { message: 'portal error' },
    })
    const { result } = renderHook(() => useStripe())
    await act(async () => {
      await result.current.openPortal()
    })
    expect(result.current.error).toBe('portal error')
  })

  it('sets loading to true round-trip and back to false on the error path', async () => {
    let resolveInvoke!: (v: { data: unknown; error: unknown }) => void
    mockClient.functions.invoke.mockImplementation(
      () =>
        new Promise((res) => {
          resolveInvoke = res as typeof resolveInvoke
        }),
    )
    const { result } = renderHook(() => useStripe())
    act(() => {
      void result.current.checkout('monthly')
    })
    await waitFor(() => expect(result.current.loading).toBe(true))
    await act(async () => {
      resolveInvoke({ data: null, error: { message: 'Edge Function returned non-2xx' } })
    })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('Edge Function returned non-2xx')
  })
})