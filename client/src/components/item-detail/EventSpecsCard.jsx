import { Building2, Calendar, MapPin, Users } from 'lucide-react'
import EventRsvpForm from './EventRsvpForm.jsx'
import { formatDate } from './detailDateFormatting.js'

export default function EventSpecsCard({isAm, item, language, rsvpStatus, rsvpName, rsvpPhone, onRsvpNameChange, onRsvpPhoneChange, onRsvpSubmit}) {
  return (
    <>
        {/* Event Quick Specs Panel */}
        {item.type === 'event' && (
          <section className="detail-event-specs-card">
            <div className="specs-grid">
              <div className="spec-box">
                <div className="spec-icon">
                  <Calendar size={22} />
                </div>
                <div>
                  <span className="spec-label">{isAm ? 'ቀን እና ሰዓት' : 'Date & Time'}</span>
                  <strong>{formatDate(item.eventDate, language)}</strong>
                  <small>{isAm && item.timeAm ? item.timeAm : item.time}</small>
                </div>
              </div>

              <div className="spec-box">
                <div className="spec-icon">
                  <MapPin size={22} />
                </div>
                <div>
                  <span className="spec-label">{isAm ? 'ቦታ / አዳራሽ' : 'Location Venue'}</span>
                  <strong>{isAm && item.location?.venueAm ? item.location.venueAm : item.location?.venue}</strong>
                  <small>{isAm && item.location?.addressAm ? item.location.addressAm : item.location?.address}</small>
                </div>
              </div>

              <div className="spec-box">
                <div className="spec-icon">
                  <Users size={22} />
                </div>
                <div>
                  <span className="spec-label">{isAm ? 'የተያዙ መቀመጫዎች' : 'Seat Availability'}</span>
                  <strong>{item.rsvpCount} / {item.capacity} {isAm ? 'ተመዝግበዋል' : 'Seats Booked'}</strong>
                  <div className="capacity-bar">
                    <div className="capacity-fill" style={{ width: `${Math.min(100, (item.rsvpCount / item.capacity) * 100)}%` }} />
                  </div>
                </div>
              </div>

              <div className="spec-box">
                <div className="spec-icon">
                  <Building2 size={22} />
                </div>
                <div>
                  <span className="spec-label">{isAm ? 'አዘጋጅ ቢሮ' : 'Organizing Body'}</span>
                  <strong>{isAm && item.organizerAm ? item.organizerAm : item.organizer}</strong>
                  <small>{isAm ? 'ይፋዊ የከተማ መድረክ' : 'Official Public Engagement'}</small>
                </div>
              </div>
            </div>

            <EventRsvpForm isAm={isAm} rsvpStatus={rsvpStatus} rsvpName={rsvpName} rsvpPhone={rsvpPhone} onNameChange={onRsvpNameChange} onPhoneChange={onRsvpPhoneChange} onSubmit={onRsvpSubmit} />

          </section>
        )}
    </>
  )
}
