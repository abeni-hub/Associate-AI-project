import { CheckCircle2, Ticket } from 'lucide-react'

export default function EventRsvpForm({isAm, rsvpStatus, rsvpName, rsvpPhone, onNameChange, onPhoneChange, onSubmit}) {
  return (
    <>
            {/* Event RSVP Box */}
            <div className="detail-rsvp-banner">
              <div className="rsvp-banner-copy">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Ticket size={20} color="#d6a854" />
                  <span>{isAm ? 'በዚህ ዝግጅት ላይ ለመሳተፍ ይመዝገቡ' : 'Reserve Your Seat for this Event'}</span>
                </h3>
                <p>
                  {isAm
                    ? 'ምዝገባው ነጻ ሲሆን በቦታው ፈጣን የመግቢያ ፍቃድና የመረጃ ሰነዶችን ለማግኘት ይረዳል።'
                    : 'Attendance is free. Registering ensures fast-track entry and session materials.'
                  }
                </p>
              </div>

              {rsvpStatus === 'success' ? (
                <div className="rsvp-success-msg" style={{ width: '100%', maxWidth: '600px' }}>
                  <CheckCircle2 size={24} color="#10b981" />
                  <div>
                    <strong>{isAm ? 'ምዝገባዎ በተሳካ ሁኔታ ተረጋግጧል!' : 'Your RSVP is Confirmed!'}</strong>
                    <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
                      {isAm
                        ? 'መቀመጫ ተይዞልዎታል። ወደ ዝግጅቱ ሲመጡ በስልክዎ የደረሰዎትን መልእክት ያሳዩ።'
                        : 'A confirmation has been saved. We look forward to seeing you at the event.'
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="detail-rsvp-form">
                  <input
                    type="text"
                    className="detail-rsvp-input"
                    placeholder={isAm ? 'ሙሉ ስምዎ…' : 'Your Full Name…'}
                    value={rsvpName}
                    onChange={onNameChange}
                    required
                  />
                  <input
                    type="tel"
                    className="detail-rsvp-input"
                    placeholder={isAm ? 'የስልክ ቁጥር (09...)' : 'Phone number (e.g. 0911...)'}
                    value={rsvpPhone}
                    onChange={onPhoneChange}
                  />
                  <button type="submit" className="detail-rsvp-btn" disabled={rsvpStatus === 'submitting'}>
                    {rsvpStatus === 'submitting'
                      ? (isAm ? 'በማረጋገጥ ላይ...' : 'Confirming...')
                      : (isAm ? 'መቀመጫ ይያዙ' : 'Confirm RSVP')
                    }
                  </button>
                </form>
              )}
            </div>
    </>
  )
}
