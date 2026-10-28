import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BidPanel from './BidPanel'
import { ToastProvider } from './Toast/ToastProvider'
import { auctionService } from '../services/auctionService'
import { vehicles } from '../data/vehicles'

// A real vehicle so the service's getVehicle() lookup succeeds during validation.
const vehicle = vehicles[0]

beforeEach(async () => {
  await auctionService.reset()
})

function renderPanel() {
  return render(
    <ToastProvider>
      <BidPanel vehicle={vehicle} />
    </ToastProvider>,
  )
}

describe('BidPanel', () => {
  it('places a bid and reflects the high-bidder state', async () => {
    const user = userEvent.setup()
    renderPanel()

    expect(screen.queryByText(/high bidder/i)).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /place bid/i }))

    // After the simulated round-trip, the bid is recorded and the UI updates.
    await screen.findAllByText(/high bidder/i)
    expect(auctionService.getSnapshot()[vehicle.id]).toHaveLength(1)
  })
})
