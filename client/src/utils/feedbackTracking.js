const TRACKING_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'

export function createFeedbackTrackingNumber() {
  const randomBytes = new Uint8Array(6)
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(randomBytes)
  } else {
    randomBytes.forEach((_, index) => { randomBytes[index] = Math.floor(Math.random() * 256) })
  }

  const suffix = Array.from(randomBytes, (value) => TRACKING_ALPHABET[value % TRACKING_ALPHABET.length]).join('')
  return `CL-${new Date().getFullYear()}-${suffix}`
}
