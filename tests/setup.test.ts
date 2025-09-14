describe('Test Setup', () => {
  it('should run basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have Jest environment configured', () => {
    expect(typeof jest).toBe('object')
    expect(typeof describe).toBe('function')
    expect(typeof it).toBe('function')
    expect(typeof expect).toBe('function')
  })

  it('should have jsdom environment', () => {
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
  })
})