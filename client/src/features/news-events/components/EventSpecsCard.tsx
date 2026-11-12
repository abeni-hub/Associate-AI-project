import { Building2, Calendar, MapPin, Users } from 'lucide-react'
import type { ChangeEvent, FormEvent } from 'react'
import EventRsvpForm from './EventRsvpForm'
import { formatDate } from './detailDateFormatting'

export interface EventSpecsCardProps {
  isAm?: boolean
  item: any
  language?: string
  rsvpStatus: string
  rsvpName: string
  rsvpPhone: string
  onRsvpNameChange: (e: ChangeEvent<HTMLInputElement>) => void
  onRsvpPhoneChange: (e: ChangeEvent<HTMLInputElement>) => void
  onRsvpSubmit?: (e: FormEvent) => void
  onSubmitRsvp?: (e: FormEvent) => void
}

export default function EventSpecsCard({
  isAm,
  item,
  language,
  rsvpStatus,
  rsvpName,
  rsvpPhone,
  onRsvpNameChange,
  onRsvpPhoneChange,
  onRsvpSubmit,
  onSubmitRsvp,
}: EventSpecsCardProps) {
  if (item.type !== 'event') return null
  const handleSubmit = onRsvpSubmit || onSubmitRsvp || (() => {})

  return (
    <section className="detail-event-specs-card">
      <div className="specs-grid">
        <div className="spec-box">
          <div className="spec-icon">
            <Calendar size={22} />
          </div>
          <div>
            <span className="spec-label">{isAm ? 'ቀን እና ሰዓት' : 'Date & Time'}</span>
            <strong>{formatDate(item.eventDate, language)}</strong>
            <small>{isAm && item.timeAm ? item.timeAm : (item.time || 'Official Municipal Hours')}</small>
          </div>
        </div>

        <div className="spec-box">
          <div className="spec-icon">
            <MapPin size={22} />
          </div>
          <div>
            <span className="spec-label">{isAm ? 'ቦታ / አዳራሽ' : 'Location Venue'}</span>
            <strong>{isAm && item.location?.venueAm ? item.location.venueAm : (item.location?.venue || 'City Hall')}</strong>
            <small>{isAm && item.location?.addressAm ? item.location.addressAm : (item.location?.address || item.subCity || 'Addis Ababa')}</small>
          </div>
        </div>

        <div className="spec-box">
          <div className="spec-icon">
            <Users size={22} />
          </div>
          <div>
            <span className="spec-label">{isAm ? 'የተያዙ መቀመጫዎች' : 'Seat Availability'}</span>
            <strong>
              {item.capacity
                ? `${item.rsvpCount || 0} / ${item.capacity} ${isAm ? 'ተመዝግበዋል' : 'Seats Booked'}`
                : (isAm ? 'ክፍት የህዝብ መድረክ' : 'Open Public Attendance')}
            </strong>
            {item.capacity && (
              <div className="capacity-bar">
                <div className="capacity-fill" style={{ width: `${Math.min(100, ((item.rsvpCount || 0) / item.capacity) * 100)}%` }} />
              </div>
            )}
          </div>
        </div>

        <div className="spec-box">
          <div className="spec-icon">
            <Building2 size={22} />
          </div>
          <div>
            <span className="spec-label">{isAm ? 'አዘጋጅ ቢሮ' : 'Organizing Body'}</span>
            <strong>{isAm && item.organizerAm ? item.organizerAm : (item.organizer || item.bureau || 'Addis Ababa Administration')}</strong>
            <small>{isAm ? 'ይፋዊ የከተማ መድረክ' : 'Official Public Engagement'}</small>
          </div>
        </div>
      </div>

      <EventRsvpForm
        isAm={isAm}
        rsvpStatus={rsvpStatus}
        rsvpName={rsvpName}
        rsvpPhone={rsvpPhone}
        onNameChange={onRsvpNameChange}
        onPhoneChange={onRsvpPhoneChange}
        onSubmit={handleSubmit}
      />
    </section>
  )
}
