import { Newspaper } from 'lucide-react'

export default function NewsEventsHero({ language }) {
  const isAm = language === 'am'

  return (
    <header className="nep-hero">
      <div className="nep-hero-content">
        <div className="nep-hero-kicker">
          <span className="nep-hero-kicker-mark" aria-hidden="true">
            <Newspaper size={14} strokeWidth={1.8} />
          </span>
          <span>{isAm ? 'አዲስ አበባ · ይፋዊ መረጃ' : 'ADDIS ABABA · PUBLIC INFORMATION'}</span>
        </div>

        <h1>
          {isAm
            ? <>የከተማችን ይፋዊ ዜናዎች፣ <em>የህዝብ መድረኮችና ዝግጅቶች</em></>
            : <>Civic News, Official Notices & <em>Community Events</em></>
          }
        </h1>

        <p>
          {isAm
            ? 'የአገልግሎት ማሻሻያዎችን፣ የህዝብ የምክክር መድረኮችን፣ የግብርና የሲቪል ምዝገባ መርሃ-ግብሮችን በአንድ ቦታ ይከታተሉ።'
            : 'Explore public service enhancements, town hall meetings, digital service launches, and community drives across Addis Ababa.'
          }
        </p>
      </div>
    </header>
  )
}
