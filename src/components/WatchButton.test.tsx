import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WatchButton from './WatchButton'
import { watchlistService } from '../services/watchlistService'

beforeEach(() => {
  watchlistService.clear()
})

describe('WatchButton', () => {
  it('toggles the saved state and the watchlist store on click', async () => {
    const user = userEvent.setup()
    render(<WatchButton vehicleId="v1" />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(watchlistService.getSnapshot().has('v1')).toBe(false)

    await user.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
    expect(watchlistService.getSnapshot().has('v1')).toBe(true)

    await user.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'false')
    expect(watchlistService.getSnapshot().has('v1')).toBe(false)
  })
})
