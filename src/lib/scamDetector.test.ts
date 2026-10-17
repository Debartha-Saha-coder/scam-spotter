import { describe, expect, it } from 'vitest'
import { analyzeMessage, getHighlightSegments } from './scamDetector'

describe('analyzeMessage', () => {
  it('identifies multiple explainable signals in a fake bank alert', () => {
    const result = analyzeMessage('BANK ALERT: Your account will be blocked today. Verify now at http://192.0.2.8/check and share your OTP to avoid suspension.')
    expect(result.risk).toBe('HIGH')
    expect(result.score).toBeGreaterThanOrEqual(60)
    expect(result.findings.map((finding) => finding.id)).toEqual(expect.arrayContaining(['threat', 'url-risk', 'otp']))
    expect(result.findings.find((finding) => finding.id === 'otp')?.matches[0]?.text).toBe('share your OTP')
  })

  it('does not assign high risk to an appointment reminder', () => {
    const result = analyzeMessage('Your appointment is confirmed for today at 3 PM.')
    expect(result.risk).toBe('LOW')
    expect(result.findings).toHaveLength(0)
    expect(result.message).toContain('does not guarantee')
  })

  it('does not flag ordinary account wording or protective link advice', () => {
    expect(analyzeMessage('Your bank account statement is ready. KYC is complete.').findings).toHaveLength(0)
    expect(analyzeMessage('Do not click suspicious links.').findings).toHaveLength(0)
  })

  it('does not treat a warning not to share an OTP as an OTP request', () => {
    const result = analyzeMessage('Never share your OTP with anyone.')
    expect(result.findings.some((finding) => finding.id === 'otp')).toBe(false)

    const laterRequest = analyzeMessage('Never share your OTP. Please send your OTP now.')
    expect(laterRequest.findings.some((finding) => finding.id === 'otp')).toBe(true)
  })

  it('ignores quoted educational scam examples', () => {
    const result = analyzeMessage('This awareness example says: "Share your OTP" is a scam tactic.')
    expect(result.findings.some((finding) => finding.id === 'otp')).toBe(false)
  })

  it('does not flag a safe warning not to share financial details', () => {
    const result = analyzeMessage('Never share your CVV or card number with anyone.')
    expect(result.findings.some((finding) => finding.id === 'personal-info')).toBe(false)
  })

  it('flags a delivery fee and link without claiming the link is malicious', () => {
    const result = analyzeMessage('Your parcel is waiting. Pay a small delivery fee using this unfamiliar link: https://parcel.example.com/fee')
    expect(result.findings.map((finding) => finding.id)).toEqual(expect.arrayContaining(['payment', 'link']))
    expect(result.findings.find((finding) => finding.id === 'link')?.explanation).toContain('not proof of a scam')
  })

  it('deduplicates repeated matches from one rule when scoring', () => {
    const once = analyzeMessage('Verify now.')
    const repeated = analyzeMessage('Verify now. Verify now. Verify now.')
    expect(repeated.score).toBe(once.score)
    expect(repeated.findings.find((finding) => finding.id === 'urgency')?.matches).toHaveLength(3)
  })

  it('preserves original text and does not duplicate overlapping highlight spans', () => {
    const message = 'Pay a small delivery fee at https://bit.ly/parcel'
    const result = analyzeMessage(message)
    const segments = getHighlightSegments(message, result.findings)
    expect(segments.map((segment) => segment.text).join('')).toBe(message)
    expect(segments.some((segment) => segment.findingIds.length > 1)).toBe(true)
  })
})
