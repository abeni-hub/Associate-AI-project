export default function DetailNotFound({ language, onBackToHub }) {
  const isAm = language === 'am'

  return (
    <div className="item-detail-page" lang={language}>
      <div className="detail-not-found section-wrap" style={{ marginTop: '32px' }}>
        <h2>{isAm ? 'የተጠየቀው መረጃ አልተገኘም' : 'Article or Event Not Found'}</h2>
        <p>{isAm ? 'የተሰረዘ ወይም ያልነበረ መረጃ ሊሆን ይችላል።' : 'The requested item could not be loaded.'}</p>
        <button type="button" className="nep-back-to-top-btn" onClick={onBackToHub}>
          {isAm ? 'ወደ ዋናው ዝርዝር ተመለስ' : 'Return to Hub'}
        </button>
      </div>
    </div>
  )
}
