import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterChips from './FilterChips'
import { emptyFilters } from '../lib/filters'

describe('FilterChips', () => {
  it('renders nothing when no filters are active', () => {
    const { container } = render(<FilterChips filters={emptyFilters} onChange={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows a chip per active filter and removes one on click', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <FilterChips
        filters={{ ...emptyFilters, makes: ['Ford'], bodyStyles: ['SUV'] }}
        onChange={onChange}
      />,
    )

    expect(screen.getByText('Ford')).toBeInTheDocument()
    expect(screen.getByText('SUV')).toBeInTheDocument()

    await user.click(screen.getByText('Ford'))
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ makes: [] }))
  })
})
