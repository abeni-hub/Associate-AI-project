
export default function DetailPageFooter({isAm, onBackToHome, onBackToHub}) {
  return (
    <>
      {/* Detail Page Footer */}
      <footer className="site-footer">
        <div className="footer-main section-wrap">
          <a className="brand footer-brand" href="#/" onClick={(e) => { e.preventDefault(); onBackToHome() }}>
            <span className="brand-copy"><strong>Civic<span>Link</span></strong><small>{isAm ? 'ኢትዮጵያ · የዜጎች አገልግሎት' : 'ETHIOPIA · CITIZEN SERVICES'}</small></span>
          </a>
          <p>{isAm ? 'ግልጽ መረጃ ለእያንዳንዱ ጉብኝት። ፈጣን ምላሽ የሚሰጥ የህዝብ አገልግሎት።' : 'Clearer information for every visit. A more responsive public service.'}</p>
          <div className="footer-nav">
            <a href="#find-service" onClick={onBackToHome}>{isAm ? 'አገልግሎት ይፈልጉ' : 'Find a service'}</a>
            <a href="#how-it-works" onClick={onBackToHome}>{isAm ? 'አጠቃቀሙ እንዴት ነው?' : 'How it works'}</a>
            <a href="#news" onClick={onBackToHub}>{isAm ? 'ዜና እና ዝግጅቶች' : 'News & events'}</a>
          </div>
        </div>
        <div className="footer-bottom section-wrap">
          <span>© 2026 CivicLink Ethiopia · Public service information platform</span>
          <span>Built for citizens, maintained by bureaus.</span>
        </div>
      </footer>
    </>
  )
}
