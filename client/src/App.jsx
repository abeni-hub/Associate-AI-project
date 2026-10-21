import { useEffect, useLayoutEffect, useState } from 'react'
import './App.css'

const amharicCopy = {
  'One clear place to plan your next public service visit': 'ለሚቀጥለው የመንግሥት አገልግሎት ጉብኝትዎ የሚያስፈልግዎትን ሁሉ በአንድ ቦታ',
  'Explore the guide': 'መመሪያውን ይመልከቱ',
  'ETHIOPIA · CITIZEN SERVICES': 'ኢትዮጵያ · የዜጎች አገልግሎት',
  'CivicLink home': 'የሲቪክሊንክ መነሻ ገጽ',
  'Open navigation': 'የዳሰሳ ምናሌውን ይክፈቱ',
  'Close navigation': 'የዳሰሳ ምናሌውን ይዝጉ',
  'Switch language to Amharic': 'ቋንቋውን ወደ አማርኛ ቀይር',
  'Switch language to English': 'ቋንቋውን ወደ እንግሊዝኛ ቀይር',
  'Main navigation': 'ዋና የዳሰሳ ምናሌ',
  'Find a service': 'አገልግሎት ይፈልጉ',
  'How it works': 'አጠቃቀሙ እንዴት ነው?',
  'News & events': 'ዜና እና ዝግጅቶች',
  'Share feedback': 'አስተያየት ይስጡ',
  'Know where to go.': 'የት እንደሚሄዱ ይወቁ።',
  'Arrive ready.': 'ተዘጋጅተው ይድረሱ።',
  'The right information makes every visit easier. Find your service, prepare your documents, and know exactly where to go before you leave home.': 'ትክክለኛ መረጃ ጉብኝትዎን ቀላል ያደርገዋል። የሚፈልጉትን አገልግሎት ይምረጡ፣ ሰነዶችዎን ያዘጋጁ፣ ከቤት ከመውጣትዎ በፊትም ወዴት እንደሚሄዱ በትክክል ይወቁ።',
  'I’ve already visited': 'ቢሮውን ጎብኝቻለሁ',
  'Featured government bureaus': 'የመንግሥት ቢሮዎች ዝርዝር',
  'Choose a bureau spotlight': 'የሚታየውን ቢሮ ይምረጡ',
  'Show': 'አሳይ',
  'slide': 'ምስል',
  'Previous bureau': 'ያለፈው ቢሮ',
  'Next bureau': 'ቀጣዩ ቢሮ',
  'Pause slideshow': 'ምስሎቹን ማሳየት ያቁሙ',
  'Play slideshow': 'ምስሎቹን ማሳየት ይጀምሩ',
  'REVENUE BUREAU': 'የገቢዎች ቢሮ',
  'Revenue services, made clearer.': 'የገቢ አገልግሎቶችን በቀላሉ ይረዱ።',
  'Know what to prepare before you visit your local revenue office.': 'የአካባቢዎን የገቢዎች ቢሮ ከመጎብኘትዎ በፊት ማዘጋጀት ያለብዎትን ይወቁ።',
  'PLANNING & DEVELOPMENT': 'የዕቅድ እና ልማት',
  'A better view of what’s next.': 'ቀጣዩን እርምጃ በግልጽ ይመልከቱ።',
  'Find planning and development information for your community.': 'ለማህበረሰብዎ የዕቅድ እና ልማት መረጃ ያግኙ።',
  'CIVIL REGISTRATION': 'የሲቪል ምዝገባ',
  'The right documents. The right place.': 'ትክክለኛ ሰነዶች። ትክክለኛው ቦታ።',
  'Prepare for vital records and civil registration services.': 'ለወሳኝ ሰነዶች እና ለሲቪል ምዝገባ አገልግሎቶች ይዘጋጁ።',
  'LAND ADMINISTRATION': 'የመሬት አስተዳደር',
  'Find your way through land services.': 'የመሬት አገልግሎቶችን በቀላሉ ይጠቀሙ።',
  'See what to bring and where to go for property record services.': 'ለመሬት መዝገብ አገልግሎት ምን እንደሚያመጡና ወዴት እንደሚሄዱ ይወቁ።',
  '01': '01', '02': '02', '03': '03', '04': '04', '05': '05',
  'START HERE': 'ከዚህ ይጀምሩ',
  'What do you need help with?': 'በምን ጉዳይ እንርዳዎ?',
  'Choose a location and service to see your visit guide.': 'የጉብኝት መመሪያውን ለማየት አካባቢና አገልግሎት ይምረጡ።',
  'Sub-city': 'ክፍለ ከተማ',
  'City office / bureau': 'የከተማ ቢሮ / መምሪያ',
  'Service': 'አገልግሎት',
  'Show my guide': 'መመሪያዬን አሳይ',
  'Takes less than a minute': 'ከአንድ ደቂቃ በታች ይወስዳል',
  'No account needed': 'መለያ መክፈት አያስፈልግም',
  'YOUR VISIT GUIDE': 'የጉብኝት መመሪያዎ',
  'A clearer path,': 'ግልጽ መንገድ፣',
  'step by step.': 'ደረጃ በደረጃ።',
  'Know what to bring and which room to visit, before you set off. The sample guide below shows how service details will appear.': 'ከመነሳትዎ በፊት ምን እንደሚያመጡና ወደ የትኛው ክፍል እንደሚሄዱ ይወቁ። ከታች ያለው ምሳሌ የአገልግሎት መረጃው እንዴት እንደሚታይ ያሳያል።',
  'SAMPLE GUIDE': 'የመመሪያ ምሳሌ',
  'BEFORE YOU LEAVE': 'ከመነሳትዎ በፊት',
  'What to bring': 'ማምጣት ያለብዎት',
  'Bring original documents where available. Ask the bureau if requirements have changed.': 'የዋና ሰነዶችን ካሉ ይዘው ይምጡ። መስፈርቶቹ መቀየራቸውን ከቢሮው ያረጋግጡ።',
  'ONCE YOU ARRIVE': 'ቢሮው ሲደርሱ',
  'Your room-by-room route': 'በቢሮው ውስጥ የሚከተሉት የአገልግሎት ሂደት',
  'Something out of date? Let us know': 'ያልተዘመነ መረጃ አግኝተዋል? ያሳውቁን',
  'Service information can change. Confirm with your bureau if you are unsure.': 'የአገልግሎት መረጃ ሊቀየር ይችላል። እርግጠኛ ካልሆኑ ከቢሮው ያረጋግጡ።',
  'Illustrative example only. Bureaus will publish and maintain official requirements and room numbers in the live system.': 'ይህ ለምሳሌ ብቻ ነው። ቢሮዎች በቀጥታ ስርዓቱ ውስጥ ይፋዊ መስፈርቶችንና የክፍል ቁጥሮችን ያወጣሉ እንዲሁም ያዘምናሉ።',
  'SIMPLE FROM START TO FINISH': 'ከመጀመሪያ እስከ መጨረሻ ቀላል',
  'Three moments.': 'ሶስት ደረጃዎች።',
  'One smoother journey.': 'ይበልጥ ቀላል ጉዞ።',
  'From the moment you start planning to the moment you share your experience, everything you need is easy to find.': 'እቅድ ከማውጣት ጀምሮ ልምድዎን እስከሚያጋሩበት ድረስ፣ የሚያስፈልግዎትን ሁሉ በቀላሉ ያገኛሉ።',
  '01 / BEFORE': '01 / ከመሄድዎ በፊት',
  '02 / DURING': '02 / በጉብኝት ወቅት',
  '03 / AFTER': '03 / ከጉብኝት በኋላ',
  'BEFORE': 'ከመሄድዎ በፊት',
  'DURING': 'በጉብኝት ወቅት',
  'AFTER': 'ከጉብኝት በኋላ',
  'out of 5': 'ከ 5',
  'PHOTO:': 'ፎቶ፦',
  'Local government office building in Yeka Subcity, Addis Ababa.': 'በአዲስ አበባ የየካ ክፍለ ከተማ የአካባቢ መንግሥት ቢሮ ሕንፃ።',
  'Officials meet at Ethiopia’s Ministry of Planning and Development.': 'ባለሥልጣናት በኢትዮጵያ የዕቅድና ልማት ሚኒስቴር ስብሰባ ላይ።',
  'The Addis Ababa Civil Registration and Residency Service Agency lobby.': 'የአዲስ አበባ ሲቪል ምዝገባና የነዋሪነት አገልግሎት ኤጀንሲ መቀበያ አዳራሽ።',
  'Lemi Kura Woreda 08 local government office in Addis Ababa.': 'በአዲስ አበባ የለሚ ኩራ ወረዳ 08 የአካባቢ መንግሥት ቢሮ።',
  'Room': 'ክፍል',
  'Prepare': 'ይዘጋጁ',
  'with confidence.': 'በእርግጠኝነት።',
  'Choose your service and see the requirements, expectations, and room numbers before you leave home.': 'ከቤት ከመውጣትዎ በፊት አገልግሎትዎን ይምረጡ፤ መስፈርቶቹን፣ ማወቅ ያለብዎትን እና የክፍል ቁጥሮችን ይመልከቱ።',
  'Go straight': 'በቀጥታ ይሂዱ',
  'to the right room.': 'ወደ ትክክለኛው ክፍል።',
  'Follow your step-by-step guide inside the bureau. Spend less time finding your way around.': 'በቢሮው ውስጥ የደረጃ በደረጃ መመሪያዎን ይከተሉ። መንገድ ፍለጋ የሚያጠፉትን ጊዜ ይቀንሱ።',
  'See a sample route': 'የመንገድ ምሳሌ ይመልከቱ',
  'Share what': 'ያጋጠምዎትን',
  'you experienced.': 'ያጋሩ።',
  'Leave a complaint, suggestion, or satisfaction rating on the page or with an office QR code.': 'በዚህ ገጽ ወይም በቢሮው የQR ኮድ ቅሬታ፣ ጥቆማ ወይም የእርካታ ደረጃ ያጋሩ።',
  'Already at the bureau?': 'አሁን ቢሮው ውስጥ ነዎት?',
  'Scan the office QR code to open the right feedback form in seconds.': 'ትክክለኛውን የአስተያየት ቅጽ በፍጥነት ለመክፈት የቢሮውን QR ኮድ ያንብቡ።',
  'Go to feedback': 'ወደ አስተያየት መስጫ ይሂዱ',
  'FROM YOUR COMMUNITY': 'ከማህበረሰብዎ',
  'What’s happening': 'ምን እየተካሄደ ነው',
  'near you.': 'በአካባቢዎ?',
  'Published by sub-city admins': 'በክፍለ ከተማ አስተዳዳሪዎች የታተመ',
  'COMMUNITY UPDATE': 'የማህበረሰብ ማስታወቂያ',
  'PUBLIC NOTICE': 'ይፋዊ ማስታወቂያ',
  'EXAMPLE': 'ምሳሌ',
  'Sub-city announcements, all in one place.': 'የክፍለ ከተማ ማስታወቂያዎች በአንድ ቦታ።',
  'Find community updates and public notices shared by your local sub-city.': 'በአካባቢዎ ክፍለ ከተማ የተጋሩ የማህበረሰብ ዜናዎችንና ይፋዊ ማስታወቂያዎችን ያግኙ።',
  'UPCOMING EVENT': 'መጪ ዝግጅት',
  'Keep up with public events and service updates.': 'የህዝብ ዝግጅቶችንና የአገልግሎት ዝመናዎችን ይከታተሉ።',
  'Important dates and announcements from your community, in one easy-to-find place.': 'ከማህበረሰብዎ የሚመጡ አስፈላጊ ቀናትና ማስታወቂያዎች በቀላሉ በሚገኙበት አንድ ቦታ።',
  'LOCAL SERVICES': 'የአካባቢ አገልግሎቶች',
  'One guide to the services your bureau provides.': 'ቢሮዎ ስለሚሰጣቸው አገልግሎቶች አንድ መመሪያ።',
  'Understand what each office does and where to get the support you need.': 'እያንዳንዱ ቢሮ የሚሰጠውን አገልግሎትና የሚፈልጉትን ድጋፍ የት እንደሚያገኙ ይወቁ።',
  'News cards shown as layout examples. Official notices will be published by your local sub-city.': 'የዜና ካርዶቹ የአቀማመጥ ምሳሌዎች ናቸው። ይፋዊ ማስታወቂያዎች በአካባቢዎ ክፍለ ከተማ ይታተማሉ።',
  'YOUR VOICE HELPS': 'የእርስዎ አስተያየት ይረዳል',
  'Every experience': 'እያንዳንዱ ልምድ',
  'can make things': 'ለለውጥ',
  'better.': 'አስተዋጽኦ ያደርጋል።',
  'Tell us how your visit went. Your feedback reaches the right bureau and helps improve services for everyone.': 'ጉብኝትዎ እንዴት እንደነበር ይንገሩን። አስተያየትዎ ወደ ትክክለኛው ቢሮ ይደርሳል፤ ለሁሉም የሚሰጡ አገልግሎቶችንም ለማሻሻል ይረዳል።',
  'Scan a bureau QR code': 'የቢሮ QR ኮድ ያንብቡ',
  'Clear guidance before your visit. A simple way to be heard afterward.': 'ከጉብኝትዎ በፊት ግልጽ መመሪያ፤ ከዚያ በኋላ ድምፅዎን ለማሰማት ቀላል መንገድ።',
  'CITIZEN FEEDBACK': 'የዜጎች አስተያየት',
  'Tell us about your visit': 'ስለ ጉብኝትዎ ይንገሩን',
  'STEP 1 OF 5': 'ደረጃ 1 ከ 5',
  'STEP 2 OF 5': 'ደረጃ 2 ከ 5',
  'STEP 3 OF 5': 'ደረጃ 3 ከ 5',
  'STEP 4 OF 5': 'ደረጃ 4 ከ 5',
  'STEP 5 OF 5': 'ደረጃ 5 ከ 5',
  'What would you like to share?': 'ምን ማጋራት ይፈልጋሉ?',
  'Which sub-city did you visit?': 'የትኛውን ክፍለ ከተማ ጎበኙ?',
  'Which bureau did you visit?': 'የትኛውን ቢሮ ጎበኙ?',
  'What service did you receive?': 'ምን አገልግሎት አገኙ?',
  'Tell us a little more': 'ተጨማሪ ዝርዝር ይንገሩን',
  'A complaint': 'ቅሬታ',
  'Something needs attention': 'መፍትሄ የሚያስፈልገው ጉዳይ',
  'A suggestion': 'ጥቆማ',
  'An idea for improvement': 'ለማሻሻያ የሚረዳ ሀሳብ',
  'A rating': 'የእርካታ ደረጃ',
  'Share how it went': 'ተሞክሮዎን ያጋሩ',
  'Select the sub-city': 'ክፍለ ከተማውን ይምረጡ',
  'Select the city office / bureau': 'የከተማ ቢሮውን / መምሪያውን ይምረጡ',
  'Select the service': 'አገልግሎቱን ይምረጡ',
  'How was your experience?': 'አገልግሎቱን እንዴት አገኙት?',
  'Select a rating before submitting.': 'ከመላክዎ በፊት የእርካታ ደረጃ ይምረጡ።',
  'Your feedback': 'አስተያየትዎ',
  'Share the details that could help improve your experience…': 'አገልግሎቱን ለማሻሻል የሚረዱ ዝርዝሮችን ያጋሩ…',
  'Please don’t include personal or sensitive information.': 'የግል ወይም ሚስጥራዊ መረጃ አያካትቱ።',
  'Back': 'ወደ ኋላ',
  'Your feedback is anonymous': 'አስተያየትዎ ማንነትዎን አይገልጽም',
  'Continue': 'ቀጥል',
  'Submit feedback': 'አስተያየት ላክ',
  'Interactive preview · Connect to your feedback system to receive submissions': 'የሚሰራ ቅድመ እይታ · አስተያየቶችን ለመቀበል ከአስተያየት ስርዓትዎ ጋር ያገናኙ',
  'THANK YOU FOR SPEAKING UP': 'አስተያየትዎን ስላጋሩ እናመሰግናለን',
  'Your voice matters.': 'ድምፅዎ ዋጋ አለው።',
  'This interactive preview has completed. Connect the form to your feedback system to securely route submissions to bureau admins.': 'ይህ ቅድመ እይታ ተጠናቋል። አስተያየቶችን በደህና ወደ ቢሮ አስተዳዳሪዎች ለማድረስ ቅጹን ከአስተያየት ስርዓትዎ ጋር ያገናኙ።',
  'Send another response': 'ሌላ አስተያየት ላክ',
  'Your privacy is important': 'የግል መረጃዎ ጥበቃ አስፈላጊ ነው',
  'FOR PUBLIC SERVICE TEAMS': 'ለህዝብ አገልግሎት ቡድኖች',
  'Manage information where it belongs.': 'መረጃን በሚመለከተው ቦታ ያስተዳድሩ።',
  'Sub-city and bureau admins keep service guides, room routes, news, and feedback up to date.': 'የክፍለ ከተማና የቢሮ አስተዳዳሪዎች የአገልግሎት መመሪያዎችን፣ የክፍል መንገዶችን፣ ዜናዎችንና አስተያየቶችን ወቅታዊ ያደርጋሉ።',
  'SUPER ADMIN': 'ዋና አስተዳዳሪ',
  'SUB-CITY': 'ክፍለ ከተማ',
  'BUREAU': 'ቢሮ',
  'Clearer information for every visit.': 'ለእያንዳንዱ ጉብኝት ግልጽ መረጃ።',
  'A more responsive public service.': 'ፈጣን ምላሽ የሚሰጥ የህዝብ አገልግሎት።',
  '© 2026 CivicLink Ethiopia · Public service information platform': '© 2026 ሲቪክሊንክ ኢትዮጵያ · የህዝብ አገልግሎት መረጃ መድረክ',
  'Built for citizens, maintained by bureaus.': 'ለዜጎች የተዘጋጀ፣ በቢሮዎች የሚዘመን።',
  'Addis Ketema': 'አዲስ ከተማ', 'Akaki Kality': 'አቃቂ ቃሊቲ', 'Arada': 'አራዳ', 'Bole': 'ቦሌ',
  'Gulele': 'ጉለሌ', 'Kirkos': 'ቂርቆስ', 'Kolfe Keranio': 'ቆልፌ ቀራኒዮ', 'Lideta': 'ልደታ',
  'Lemi Kura': 'ለሚ ኩራ', 'Nifas Silk-Lafto': 'ንፋስ ስልክ ላፍቶ', 'Yeka': 'የካ',
  'Addis Ababa Revenues Bureau': 'የአዲስ አበባ ገቢዎች ቢሮ',
  'Revenues Bureau': 'የገቢዎች ቢሮ',
  'Civil Registration & Residency Service Agency': 'የሲቪል ምዝገባና የነዋሪነት አገልግሎት ኤጀንሲ',
  'CRRSA district office': 'የሲቪል ምዝገባ ወረዳ ቢሮ',
  'Land Development & Administration Bureau': 'የመሬት ልማትና አስተዳደር ቢሮ',
  'Land Development & Administration': 'የመሬት ልማትና አስተዳደር',
  'City Government Trade Bureau': 'የከተማ ንግድ ቢሮ', 'Trade Bureau': 'የንግድ ቢሮ',
  'Plan & Development Office': 'የዕቅድና ልማት ቢሮ', 'Plan & Development': 'ዕቅድና ልማት',
  'Valid kebele ID or Fayda ID, where applicable': 'ተፈጻሚ ከሆነ ትክክለኛ የቀበሌ መታወቂያ ወይም የፋይዳ መታወቂያ',
  'Relevant account, record, or application reference': 'ከጉዳዩ ጋር የተያያዘ የሂሳብ፣ የመዝገብ ወይም የማመልከቻ ቁጥር',
  'Service desk': 'የአገልግሎት መቀበያ', 'Confirm the right service and current requirements.': 'ትክክለኛውን አገልግሎትና ወቅታዊ መስፈርቶች ያረጋግጡ።',
  'Request review': 'የጥያቄ ምርመራ', 'An officer checks your request and supporting details.': 'ባለሙያው ጥያቄዎንና አብረው የቀረቡ ዝርዝሮችን ይመረምራል።',
  'Next step': 'ቀጣይ እርምጃ', 'Complete the service or collect its confirmation.': 'አገልግሎቱን ያጠናቅቁ ወይም ማረጋገጫውን ይውሰዱ።',
  'e-TIN registration': 'የኢ-ቲን ምዝገባ', 'Register for or update a taxpayer identification number.': 'የግብር ከፋይ መለያ ቁጥር ያውጡ ወይም መረጃውን ያዘምኑ።',
  'Tax payment': 'የግብር ክፍያ', 'Check tax payment options and obtain a payment confirmation.': 'የግብር መክፈያ አማራጮችን ይመልከቱና የክፍያ ማረጋገጫ ያግኙ።',
  'Digital tax clearance': 'ዲጂታል የግብር ክሊራንስ', 'Request a tax clearance certificate.': 'የግብር ክሊራንስ ሰርተፍኬት ይጠይቁ።',
  'Tax estimate (VAT, income, turnover)': 'የግብር ግምት (ተ.እ.ታ፣ ገቢ፣ የሽያጭ መጠን)', 'Use the bureau’s tax simulator to estimate a tax amount.': 'የሚገመተውን የግብር መጠን ለማወቅ የቢሮውን የግብር ማስያ ይጠቀሙ።',
  'Birth registration & certificate': 'የልደት ምዝገባና ሰርተፍኬት', 'Register a child’s birth within 90 days and receive the official civil registration certificate.': 'የልጅዎን ልደት በ90 ቀናት ውስጥ ያስመዝግቡና ይፋዊ የሲቪል ምዝገባ ሰርተፍኬት ይቀበሉ።',
  'Registration steps': 'የምዝገባ ደረጃዎች', 'Call CRRSA at 7533 to confirm the district office serving your address in Bole and its current desk location.': 'የቦሌ አድራሻዎን የሚያገለግለውን የወረዳ ቢሮና የአገልግሎት መቀበያ ቦታ ለማረጋገጥ ወደ 7533 ይደውሉ።',
  'Bring identification and evidence that you are the child’s parent, guardian, or custodian.': 'መታወቂያዎንና የልጁ ወላጅ፣ አሳዳጊ ወይም ህጋዊ ጠባቂ መሆንዎን የሚያሳይ ማስረጃ ይዘው ይምጡ።',
  'For a birth at a health facility, bring the birth notification paper issued by the facility.': 'ልጁ በጤና ተቋም ከተወለደ፣ ተቋሙ የሰጠውን የልደት ማሳወቂያ ወረቀት ይዘው ይምጡ።',
  'Have the child’s full name, date and place of birth ready. For late registration, bring the reason and supporting evidence.': 'የልጁን ሙሉ ስም፣ የተወለደበትን ቀንና ቦታ ያዘጋጁ። ዘግይቶ ለሚደረግ ምዝገባ ምክንያቱንና ደጋፊ ማስረጃዎችን ይዘው ይምጡ።',
  'Local office': 'የአካባቢ ቢሮ', 'Choose the correct registration office': 'ትክክለኛውን የምዝገባ ቢሮ ይምረጡ', 'Use the civil registration office serving a parent or guardian’s principal residence, or the office or health facility where the birth occurred.': 'ወላጁን ወይም አሳዳጊውን የሚያገለግለውን የሲቪል ምዝገባ ቢሮ፣ ወይም ልደቱ የተፈጸመበትን ቢሮ ወይም የጤና ተቋም ይጠቀሙ።',
  'Declare': 'ልደቱን ያሳውቁ', 'Make the birth declaration': 'የልደት ማሳወቂያ ያቅርቡ', 'The parent or authorized guardian appears in person; the civil status officer records and checks the birth details.': 'ወላጁ ወይም ስልጣን የተሰጠው አሳዳጊ በአካል ይቀርባል፤ የሲቪል ሁኔታ ባለሙያውም የልደቱን ዝርዝር መረጃ መዝግቦ ያረጋግጣል።',
  'Certificate': 'ሰርተፍኬት', 'Receive the birth certificate': 'የልደት ሰርተፍኬቱን ይቀበሉ', 'The civil status officer completes the registration and issues the official certificate.': 'የሲቪል ሁኔታ ባለሙያው ምዝገባውን አጠናቆ ይፋዊውን ሰርተፍኬት ይሰጣል።',
  'Marriage registration / certificate': 'የጋብቻ ምዝገባ / ሰርተፍኬት', 'Register a marriage or request a marriage certificate.': 'ጋብቻ ያስመዝግቡ ወይም የጋብቻ ሰርተፍኬት ይጠይቁ።',
  'Death registration / certificate': 'የሞት ምዝገባ / ሰርተፍኬት', 'Register a death or request a death certificate.': 'ሞት ያስመዝግቡ ወይም የሞት ሰርተፍኬት ይጠይቁ።',
  'Divorce registration': 'የፍቺ ምዝገባ', 'Register a divorce or request a divorce record.': 'ፍቺ ያስመዝግቡ ወይም የፍቺ መዝገብ ይጠይቁ።',
  'Adoption registration': 'የጉዲፈቻ ምዝገባ', 'Register an adoption or request its supporting record.': 'ጉዲፈቻ ያስመዝግቡ ወይም ደጋፊ ሰነዱን ይጠይቁ።',
  'Residence ID card': 'የነዋሪነት መታወቂያ', 'Apply for or update a resident identification card.': 'የነዋሪነት መታወቂያ ያመልክቱ ወይም መረጃውን ያዘምኑ።',
  'Family registration': 'የቤተሰብ ምዝገባ', 'Register or update a family record.': 'የቤተሰብ መዝገብ ያስመዝግቡ ወይም ያዘምኑ።',
  'Residence transfer': 'የነዋሪነት ለውጥ ምዝገባ', 'Update a residence record after moving.': 'ከተዛወሩ በኋላ የነዋሪነት መዝገብዎን ያዘምኑ።',
  'Non-marital certificate': 'ያላገባ / ያላገባች መሆን ሰርተፍኬት', 'Request a certificate of non-marital status.': 'ያላገባ / ያላገባች መሆንን የሚያረጋግጥ ሰርተፍኬት ይጠይቁ።',
  'Residency verification': 'የነዋሪነት ማረጋገጫ', 'Request verification of a residence record.': 'የነዋሪነት መዝገብ ማረጋገጫ ይጠይቁ።',
  'Landholding record / correction': 'የይዞታ መዝገብ / ማስተካከያ', 'Request land record information or a record correction.': 'የመሬት መዝገብ መረጃ ወይም የመዝገብ ማስተካከያ ይጠይቁ።',
  'Land rights creation / transfer': 'የመሬት መብት መመስረት / ማስተላለፍ', 'Request a land-rights creation or transfer service.': 'የመሬት መብት መመስረት ወይም ማስተላለፍ አገልግሎት ይጠይቁ።',
  'Land lease tender information': 'የመሬት ሊዝ ጨረታ መረጃ', 'Find information about a city land lease tender.': 'ስለ ከተማው የመሬት ሊዝ ጨረታ መረጃ ያግኙ።',
  'Integrated land information': 'የተቀናጀ የመሬት መረጃ', 'Request land information or records support.': 'የመሬት መረጃ ወይም የመዝገብ ድጋፍ ይጠይቁ።',
  'Land preparation and transfer': 'የመሬት ዝግጅትና ማስተላለፍ', 'Ask about land preparation and transfer services.': 'ስለ መሬት ዝግጅትና ማስተላለፍ አገልግሎቶች ይጠይቁ።',
  'New business license': 'አዲስ የንግድ ፈቃድ', 'Apply for a new business license.': 'አዲስ የንግድ ፈቃድ ያመልክቱ።',
  'Business license renewal': 'የንግድ ፈቃድ እድሳት', 'Renew an existing business license.': 'ያለዎትን የንግድ ፈቃድ ያድሱ።',
  'Business license amendment': 'የንግድ ፈቃድ ማሻሻያ', 'Update details on a business license.': 'በንግድ ፈቃድ ላይ ያለውን መረጃ ያዘምኑ።',
  'Replace a lost or damaged license': 'የጠፋ ወይም የተበላሸ ፈቃድ ምትክ', 'Request a replacement business license.': 'ምትክ የንግድ ፈቃድ ይጠይቁ።',
  'Business license cancellation': 'የንግድ ፈቃድ ስረዛ', 'Request cancellation of a business license.': 'የንግድ ፈቃድ እንዲሰረዝ ይጠይቁ።',
  'Commercial registration amendment': 'የንግድ ምዝገባ ማሻሻያ', 'Update commercial registration details.': 'የንግድ ምዝገባ መረጃን ያዘምኑ።',
  'Commercial registration cancellation': 'የንግድ ምዝገባ ስረዛ', 'Request cancellation of commercial registration.': 'የንግድ ምዝገባ እንዲሰረዝ ይጠይቁ።',
  'Structural plan preparation / amendment': 'የመዋቅር ፕላን ዝግጅት / ማሻሻያ', 'Request preparation or amendment of a city structural plan.': 'የከተማ መዋቅራዊ ፕላን እንዲዘጋጅ ወይም እንዲሻሻል ይጠይቁ።',
  'Infrastructure design review': 'የመሠረተ ልማት ዲዛይን ግምገማ', 'Request review of an infrastructure design.': 'የመሠረተ ልማት ዲዛይን እንዲገመገም ይጠይቁ።',
  'Spatial plan information': 'የቦታ ፕላን መረጃ', 'Request information or clarification about a spatial plan.': 'ስለ ቦታ ፕላን መረጃ ወይም ማብራሪያ ይጠይቁ።',
  'City statistics and documentation': 'የከተማ ስታቲስቲክስና ሰነዶች', 'Request social and economic statistics or documentation.': 'ማህበራዊና ኢኮኖሚያዊ ስታቲስቲክስ ወይም ሰነዶች ይጠይቁ።',
  'Plan implementation information': 'የፕላን አፈጻጸም መረጃ', 'Ask about plan implementation and related city services.': 'ስለ ፕላን አፈጻጸምና ተያያዥ የከተማ አገልግሎቶች ይጠይቁ።',
}

function translate(text, language) {
  return language === 'am' ? (amharicCopy[text] ?? text) : text
}

const iconPaths = {
  arrow: <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
  chevron: <path d="m7 10 5 5 5-5" />,
  pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
  route: <><circle cx="6" cy="18" r="2" /><circle cx="18" cy="6" r="2" /><path d="M8 18h3a4 4 0 0 0 4-4V10a4 4 0 0 1 4-4" /></>,
  heart: <path d="M20.8 8.6c0 4.3-8.8 10-8.8 10s-8.8-5.7-8.8-10A4.5 4.5 0 0 1 12 6.1a4.5 4.5 0 0 1 8.8 2.5Z" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  check: <><path d="m5 12 4 4L19 6" /></>,
  pause: <><path d="M8 5v14M16 5v14" /></>,
  play: <path d="m8 5 12 7-12 7z" />,
  news: <><path d="M4 4h16v16H4z" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
  building: <><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 9h.01M15 9h.01M9 12h.01M15 12h.01" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></>,
  qr: <><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h3v3h-3zM19 14v2M17 19h3M19 19v1" /></>,
  sparkle: <><path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4L12 3Z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z" /></>,
}

function Icon({ name, size = 20, strokeWidth = 1.8, className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {iconPaths[name]}
    </svg>
  )
}

function BrandMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 42 42" className="brand-mark">
      <rect width="42" height="42" rx="13" fill="#00485a" />
      <path d="M12 29V16.5L21 11l9 5.5V29M17 29v-7h8v7M9.5 29h23" fill="none" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="21" cy="16.5" r="1.5" fill="#ddaf5d" />
    </svg>
  )
}

const subCityOptions = [
  'Addis Ketema',
  'Akaki Kality',
  'Arada',
  'Bole',
  'Gulele',
  'Kirkos',
  'Kolfe Keranio',
  'Lideta',
  'Lemi Kura',
  'Nifas Silk-Lafto',
  'Yeka',
]

const bureauOptions = [
  { id: 'revenue', label: 'Addis Ababa Revenues Bureau', shortLabel: 'Revenues Bureau' },
  { id: 'civil', label: 'Civil Registration & Residency Service Agency', shortLabel: 'CRRSA district office' },
  { id: 'land', label: 'Land Development & Administration Bureau', shortLabel: 'Land Development & Administration' },
  { id: 'trade', label: 'City Government Trade Bureau', shortLabel: 'Trade Bureau' },
  { id: 'planning', label: 'Plan & Development Office', shortLabel: 'Plan & Development' },
]

const sampleService = (id, label, summary) => ({
  id,
  label,
  summary,
  documents: ['Valid kebele ID or Fayda ID, where applicable', 'Relevant account, record, or application reference'],
  steps: [
    { room: '01', title: 'Service desk', detail: 'Confirm the right service and current requirements.' },
    { room: '02', title: 'Request review', detail: 'An officer checks your request and supporting details.' },
    { room: '03', title: 'Next step', detail: 'Complete the service or collect its confirmation.' },
  ],
})

const serviceCatalog = {
  revenue: [
    sampleService('tin-registration', 'e-TIN registration', 'Register for or update a taxpayer identification number.'),
    sampleService('tax-payment', 'Tax payment', 'Check tax payment options and obtain a payment confirmation.'),
    sampleService('tax-clearance', 'Digital tax clearance', 'Request a tax clearance certificate.'),
    sampleService('tax-simulator', 'Tax estimate (VAT, income, turnover)', 'Use the bureau’s tax simulator to estimate a tax amount.'),
  ],
  civil: [
    {
      ...sampleService('birth-copy', 'Birth registration & certificate', 'Register a child’s birth within 90 days and receive the official civil registration certificate.'),
      routeHeading: 'Registration steps',
      visitNote: 'Call CRRSA at 7533 to confirm the district office serving your address in Bole and its current desk location.',
      documents: [
        'Bring identification and evidence that you are the child’s parent, guardian, or custodian.',
        'For a birth at a health facility, bring the birth notification paper issued by the facility.',
        'Have the child’s full name, date and place of birth ready. For late registration, bring the reason and supporting evidence.',
      ],
      steps: [
        { room: '01', routeLabel: 'Local office', title: 'Choose the correct registration office', detail: 'Use the civil registration office serving a parent or guardian’s principal residence, or the office or health facility where the birth occurred.' },
        { room: '02', routeLabel: 'Declare', title: 'Make the birth declaration', detail: 'The parent or authorized guardian appears in person; the civil status officer records and checks the birth details.' },
        { room: '03', routeLabel: 'Certificate', title: 'Receive the birth certificate', detail: 'The civil status officer completes the registration and issues the official certificate.' },
      ],
    },
    sampleService('marriage-record', 'Marriage registration / certificate', 'Register a marriage or request a marriage certificate.'),
    sampleService('death-certificate', 'Death registration / certificate', 'Register a death or request a death certificate.'),
    sampleService('divorce-record', 'Divorce registration', 'Register a divorce or request a divorce record.'),
    sampleService('adoption-record', 'Adoption registration', 'Register an adoption or request its supporting record.'),
    sampleService('residence-id', 'Residence ID card', 'Apply for or update a resident identification card.'),
    sampleService('family-registration', 'Family registration', 'Register or update a family record.'),
    sampleService('residence-transfer', 'Residence transfer', 'Update a residence record after moving.'),
    sampleService('non-marital-certificate', 'Non-marital certificate', 'Request a certificate of non-marital status.'),
    sampleService('residency-verification', 'Residency verification', 'Request verification of a residence record.'),
  ],
  land: [
    sampleService('ownership-copy', 'Landholding record / correction', 'Request land record information or a record correction.'),
    sampleService('land-transfer', 'Land rights creation / transfer', 'Request a land-rights creation or transfer service.'),
    sampleService('land-lease', 'Land lease tender information', 'Find information about a city land lease tender.'),
    sampleService('land-information', 'Integrated land information', 'Request land information or records support.'),
    sampleService('land-preparation', 'Land preparation and transfer', 'Ask about land preparation and transfer services.'),
  ],
  trade: [
    sampleService('business-license', 'New business license', 'Apply for a new business license.'),
    sampleService('business-renewal', 'Business license renewal', 'Renew an existing business license.'),
    sampleService('business-amendment', 'Business license amendment', 'Update details on a business license.'),
    sampleService('business-replacement', 'Replace a lost or damaged license', 'Request a replacement business license.'),
    sampleService('business-cancellation', 'Business license cancellation', 'Request cancellation of a business license.'),
    sampleService('registration-amendment', 'Commercial registration amendment', 'Update commercial registration details.'),
    sampleService('registration-cancellation', 'Commercial registration cancellation', 'Request cancellation of commercial registration.'),
  ],
  planning: [
    sampleService('structural-plan', 'Structural plan preparation / amendment', 'Request preparation or amendment of a city structural plan.'),
    sampleService('infrastructure-review', 'Infrastructure design review', 'Request review of an infrastructure design.'),
    sampleService('spatial-plan-information', 'Spatial plan information', 'Request information or clarification about a spatial plan.'),
    sampleService('planning-statistics', 'City statistics and documentation', 'Request social and economic statistics or documentation.'),
    sampleService('planning-implementation', 'Plan implementation information', 'Ask about plan implementation and related city services.'),
  ],
}

const serviceFor = (bureauId, serviceId) =>
  serviceCatalog[bureauId]?.find((service) => service.id === serviceId) ?? serviceCatalog[bureauId]?.[0]

const heroSlides = [
  {
    bureau: 'REVENUE BUREAU',
    title: 'Revenue services, made clearer.',
    description: 'Know what to prepare before you visit your local revenue office.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Local_government_building%2C_Yeka_Subcity%2C_Addis_Ababa.jpg/1280px-Local_government_building%2C_Yeka_Subcity%2C_Addis_Ababa.jpg',
    alt: 'Local government office building in Yeka Subcity, Addis Ababa.',
    credit: 'Yeka Subcity Office · Mjr74 (CC BY 4.0)',
    source: 'https://commons.wikimedia.org/wiki/File:Local_government_building,_Yeka_Subcity,_Addis_Ababa.jpg',
    tint: '#164d58',
  },
  {
    bureau: 'PLANNING & DEVELOPMENT',
    title: 'A better view of what’s next.',
    description: 'Find planning and development information for your community.',
    image: 'https://mopd.gov.et/media/492570380_994507082831520_8549139107595449985_n.jpg',
    alt: 'Officials meet at Ethiopia’s Ministry of Planning and Development.',
    credit: 'Ministry of Planning & Development',
    source: 'https://mopd.gov.et/',
    tint: '#365b63',
  },
  {
    bureau: 'CIVIL REGISTRATION',
    title: 'The right documents. The right place.',
    description: 'Prepare for vital records and civil registration services.',
    image: 'https://aacrrsa.gov.et/uploads/Blog/662a29f023bf6.438697344_821273923352047_6926469178446352208_n.jpg',
    alt: 'The Addis Ababa Civil Registration and Residency Service Agency lobby.',
    credit: 'Civil Registration & Residency Service Agency',
    source: 'https://aacrrsa.gov.et/',
    tint: '#3b625e',
  },
  {
    bureau: 'LAND ADMINISTRATION',
    title: 'Find your way through land services.',
    description: 'See what to bring and where to go for property record services.',
    image: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Lemikurasubcityworeda08.jpg',
    alt: 'Lemi Kura Woreda 08 local government office in Addis Ababa.',
    credit: 'Lemi Kura Woreda 08 · Khajitdadddy (CC BY-SA 4.0)',
    source: 'https://commons.wikimedia.org/wiki/File:Lemikurasubcityworeda08.jpg',
    tint: '#536458',
  },
]

function HeroBureauCarousel({ activeIndex, onSlideChange, isPlaying, onPlayingChange, t }) {
  const slide = heroSlides[activeIndex]

  return (
    <section className="hero-carousel" aria-label={t('Featured government bureaus')} aria-roledescription="carousel" style={{ '--slide-tint': slide.tint }}>
      <div className="hero-photo-stack">
        {heroSlides.map((item, index) => <img key={item.bureau} className={`hero-photo ${index === activeIndex ? 'is-active' : ''}`} src={item.image} alt={index === activeIndex ? t(item.alt) : ''} aria-hidden={index !== activeIndex} loading={index === 0 ? 'eager' : 'lazy'} onError={(event) => { event.currentTarget.style.display = 'none' }} />)}
      </div>
      <div className="hero-photo-scrim" />
      <div key={slide.bureau} className="hero-carousel-caption" aria-live={isPlaying ? 'off' : 'polite'} aria-atomic="true">
        <span className="hero-slide-count">0{activeIndex + 1} <i>/ 0{heroSlides.length}</i></span>
        <span className="hero-bureau-tag">{t(slide.bureau)}</span>
        <h2>{t(slide.title)}</h2>
        <p>{t(slide.description)}</p>
      </div>
      <div className="hero-carousel-bottom">
        <div className="hero-carousel-dots" role="group" aria-label={t('Choose a bureau spotlight')}>{heroSlides.map((item, index) => <button key={item.bureau} type="button" className={`hero-carousel-dot ${index === activeIndex ? 'is-active' : ''}`} aria-label={`${t('Show')} ${t(item.bureau).toLowerCase()} ${t('slide')}`} aria-pressed={index === activeIndex} onClick={() => onSlideChange(index)} />)}</div>
        <div className="hero-carousel-controls">
          <button type="button" aria-label={t('Previous bureau')} onClick={() => onSlideChange((activeIndex - 1 + heroSlides.length) % heroSlides.length)}><Icon name="arrow" size={17} className="flip-horizontal" /></button>
          <button type="button" aria-label={t('Next bureau')} onClick={() => onSlideChange((activeIndex + 1) % heroSlides.length)}><Icon name="arrow" size={17} /></button>
          <button type="button" aria-label={t(isPlaying ? 'Pause slideshow' : 'Play slideshow')} aria-pressed={!isPlaying} onClick={onPlayingChange}><Icon name={isPlaying ? 'pause' : 'play'} size={15} /></button>
        </div>
      </div>
      <span className="hero-photo-credit">{t('PHOTO:')} <a href={slide.source} target="_blank" rel="noreferrer">{slide.credit}</a></span>
    </section>
  )
}

function App() {
  const [language, setLanguage] = useState(() => window.localStorage.getItem('civiclink-language') === 'am' ? 'am' : 'en')
  const [menuOpen, setMenuOpen] = useState(false)
  const [heroSlideIndex, setHeroSlideIndex] = useState(0)
  const [heroCarouselPlaying, setHeroCarouselPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [subCity, setSubCity] = useState('Bole')
  const [bureauId, setBureauId] = useState('civil')
  const [serviceId, setServiceId] = useState('birth-copy')
  const [serviceGuide, setServiceGuide] = useState({ subCity: 'Bole', bureauId: 'civil', serviceId: 'birth-copy' })
  const [feedbackStep, setFeedbackStep] = useState(1)
  const [feedbackType, setFeedbackType] = useState('')
  const [feedbackCity, setFeedbackCity] = useState('Bole')
  const [feedbackBureau, setFeedbackBureau] = useState('civil')
  const [feedbackService, setFeedbackService] = useState('birth-copy')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [satisfaction, setSatisfaction] = useState(0)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const t = (text) => translate(text, language)

  const activeServiceList = serviceCatalog[bureauId] ?? []
  const activeFeedbackServiceList = serviceCatalog[feedbackBureau] ?? []
  const guideService = serviceFor(serviceGuide.bureauId, serviceGuide.serviceId)
  const guideBureau = bureauOptions.find((bureau) => bureau.id === serviceGuide.bureauId)
  const activeHeroSlide = heroSlides[heroSlideIndex]

  useEffect(() => {
    if (!heroCarouselPlaying) return undefined
    const timer = window.setInterval(() => {
      setHeroSlideIndex((index) => (index + 1) % heroSlides.length)
    }, 7000)
    return () => window.clearInterval(timer)
  }, [heroCarouselPlaying])

  useEffect(() => {
    window.localStorage.setItem('civiclink-language', language)
    document.documentElement.lang = language
    document.title = language === 'am' ? 'ሲቪክሊንክ ኢትዮጵያ — የዜጎች አገልግሎት' : 'CivicLink Ethiopia — Citizen Services, Made Clear'
    const description = document.querySelector('meta[name="description"]')
    if (description) description.content = language === 'am'
      ? 'የኢትዮጵያን የህዝብ አገልግሎቶች ለመጠቀም ይዘጋጁ። ሰነዶችን፣ የቢሮ ሂደቶችን፣ የማህበረሰብ ዜናዎችንና የአስተያየት መንገዶችን በአንድ ቦታ ያግኙ።'
      : 'Plan your visit to Ethiopian public services. Find the documents, office steps, community news, and feedback channels you need in one place.'
  }, [language])

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const targets = document.querySelectorAll('.scroll-reveal, .scroll-reveal-group')
    if (!targets.length) return undefined

    if (!('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-visible'))
      return undefined
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.remove('is-pending')
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.14, rootMargin: '0px 0px -48px 0px' })

    targets.forEach((target) => {
      target.classList.add('is-pending')
      observer.observe(target)
    })

    return () => observer.disconnect()
  }, [])

  function handleFindService(event) {
    event.preventDefault()
    setServiceGuide({ subCity, bureauId, serviceId })
    window.setTimeout(() => document.getElementById('service-guide')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30)
  }

  function changeBureau(nextBureau, updateFeedback = false) {
    const firstService = serviceCatalog[nextBureau]?.[0]?.id ?? ''
    if (updateFeedback) {
      setFeedbackBureau(nextBureau)
      setFeedbackService(firstService)
    } else {
      setBureauId(nextBureau)
      setServiceId(firstService)
    }
  }

  function goToFeedback() {
    setMenuOpen(false)
    document.getElementById('feedback')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function nextFeedbackStep() {
    if (feedbackStep < 5) setFeedbackStep((step) => step + 1)
  }

  function submitFeedback(event) {
    event.preventDefault()
    if (!feedbackMessage.trim() || (feedbackType === 'Satisfaction' && !satisfaction)) return
    setFeedbackSubmitted(true)
  }

  return (
    <div className="site-shell" lang={language}>
      <div className="announcement-bar"><span className="announcement-dot" /><span className="announcement-copy">{t('One clear place to plan your next public service visit')}</span><a href="#find-service">{t('Explore the guide')} <Icon name="arrow" size={14} /></a></div>

      <header className="site-header">
        <a className="brand" href="#top" aria-label={t('CivicLink home')}>
          <BrandMark />
          <span className="brand-copy"><strong>Civic<span>Link</span></strong><small>{t('ETHIOPIA · CITIZEN SERVICES')}</small></span>
        </a>
        <button className="mobile-menu-button" type="button" aria-label={t(menuOpen ? 'Close navigation' : 'Open navigation')} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
        </button>
        <nav className={menuOpen ? 'main-nav is-open' : 'main-nav'} aria-label={t('Main navigation')}>
          <a href="#find-service" onClick={() => setMenuOpen(false)}>{t('Find a service')}</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>{t('How it works')}</a>
          <a href="#news" onClick={() => setMenuOpen(false)}>{t('News & events')}</a>
          <button className="language-toggle" type="button" aria-label={t(language === 'en' ? 'Switch language to Amharic' : 'Switch language to English')} onClick={() => setLanguage((current) => current === 'en' ? 'am' : 'en')}><span lang={language === 'en' ? 'am' : 'en'}>{language === 'en' ? 'አማርኛ' : 'English'}</span></button>
          <button className="nav-feedback" type="button" onClick={goToFeedback}>{t('Share feedback')} <Icon name="arrow" size={16} /></button>
        </nav>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-line" /> {t(activeHeroSlide.bureau)}</div>
            <h1>{t('Know where to go.')}<br /><em>{t('Arrive ready.')}</em></h1>
            <p className="hero-lede">{t('The right information makes every visit easier. Find your service, prepare your documents, and know exactly where to go before you leave home.')}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#find-service">{t('Find a service')} <Icon name="arrow" size={18} /></a>
              <button className="button button-secondary" type="button" onClick={goToFeedback}><span className="feedback-play">↗</span> {t('I’ve already visited')}</button>
            </div>
          </div>
          <HeroBureauCarousel activeIndex={heroSlideIndex} onSlideChange={setHeroSlideIndex} isPlaying={heroCarouselPlaying} onPlayingChange={() => setHeroCarouselPlaying((playing) => !playing)} t={t} />
        </section>

        <section className="quick-search scroll-reveal" id="find-service">
          <div className="quick-search-heading">
            <div className="section-kicker"><span>01</span> {t('START HERE')}</div>
            <h2>{t('What do you need help with?')}</h2>
            <p>{t('Choose a location and service to see your visit guide.')}</p>
          </div>
          <form className="search-form scroll-reveal-group" onSubmit={handleFindService}>
            <label className="select-field"><span>{t('Sub-city')}</span><span className="select-wrap"><Icon name="pin" size={18} /><select value={subCity} onChange={(event) => setSubCity(event.target.value)}>{subCityOptions.map((name) => <option key={name} value={name}>{t(name)}</option>)}</select><Icon name="chevron" size={16} /></span></label>
            <label className="select-field"><span>{t('City office / bureau')}</span><span className="select-wrap"><Icon name="building" size={18} /><select value={bureauId} onChange={(event) => changeBureau(event.target.value)}>{bureauOptions.map((bureau) => <option key={bureau.id} value={bureau.id}>{t(bureau.label)}</option>)}</select><Icon name="chevron" size={16} /></span></label>
            <label className="select-field"><span>{t('Service')}</span><span className="select-wrap"><Icon name="file" size={18} /><select value={serviceId} onChange={(event) => setServiceId(event.target.value)}>{activeServiceList.map((service) => <option key={service.id} value={service.id}>{t(service.label)}</option>)}</select><Icon name="chevron" size={16} /></span></label>
            <button className="button button-primary search-button" type="submit"><Icon name="search" size={18} /> {t('Show my guide')}</button>
          </form>
          <div className="search-footnote"><Icon name="sparkle" size={15} /> {t('Takes less than a minute')} <span>·</span> {t('No account needed')}</div>
        </section>

        <section className="service-guide-section section-wrap" id="service-guide">
          <div className="section-intro service-intro scroll-reveal">
            <div><div className="section-kicker"><span>02</span> {t('YOUR VISIT GUIDE')}</div><h2>{t('A clearer path,')}<br /><em>{t('step by step.')}</em></h2></div>
            <p>{t('Know what to bring and which room to visit, before you set off. The sample guide below shows how service details will appear.')}</p>
          </div>
          <article className="guide-card scroll-reveal">
            <div className="guide-card-top">
              <div><div className="guide-location"><Icon name="pin" size={15} /> {t(serviceGuide.subCity)} {t('Sub-city')} <span>·</span> {guideBureau && t(guideBureau.shortLabel)}</div><h3>{guideService && t(guideService.label)}</h3><p>{guideService && t(guideService.summary)}</p></div>
              <div className="sample-badge"><span /> {t('SAMPLE GUIDE')}</div>
            </div>
            <div className="guide-content-grid scroll-reveal-group">
              <div className="documents-panel"><div className="panel-title"><span className="panel-icon green-icon"><Icon name="file" size={18} /></span><div><span className="panel-overline">{t('BEFORE YOU LEAVE')}</span><h4>{t('What to bring')}</h4></div></div><ul className="document-list">{guideService?.documents.map((document) => <li key={document}><Icon name="check" size={15} />{t(document)}</li>)}</ul><div className="expectations-note"><Icon name="shield" size={16} /><span>{t('Bring original documents where available. Ask the bureau if requirements have changed.')}</span></div></div>
              <div className="route-panel"><div className="panel-title"><span className="panel-icon yellow-icon"><Icon name="route" size={18} /></span><div><span className="panel-overline">{t('ONCE YOU ARRIVE')}</span><h4>{t(guideService?.routeHeading ?? 'Your room-by-room route')}</h4></div></div><ol className="room-route">{guideService?.steps.map((step, index) => <li key={`${step.room}-${step.title}`}><span className="route-number">0{index + 1}</span><span className="route-track"><i /></span><span className="room-pill">{t(step.routeLabel ?? 'Room')} {step.routeLabel ? '' : step.room}</span><span className="route-description"><b>{t(step.title)}</b><small>{t(step.detail)}</small></span></li>)}</ol></div>
            </div>
            <div className="guide-card-bottom"><span><Icon name="clock" size={16} /> {t(guideService?.visitNote ?? 'Service information can change. Confirm with your bureau if you are unsure.')}</span><a href="#feedback">{t('Something out of date? Let us know')} <Icon name="arrow" size={15} /></a></div>
          </article>
          <p className="sample-disclaimer scroll-reveal">{t('Illustrative example only. Bureaus will publish and maintain official requirements and room numbers in the live system.')}</p>
        </section>

        <section className="journey-section" id="how-it-works">
          <div className="section-wrap">
            <div className="section-intro journey-intro scroll-reveal">
              <div><div className="section-kicker"><span>03</span> {t('SIMPLE FROM START TO FINISH')}</div><h2>{t('Three moments.')}<br /><em>{t('One smoother journey.')}</em></h2></div>
              <p>{t('From the moment you start planning to the moment you share your experience, everything you need is easy to find.')}</p>
            </div>
            <div className="journey-cards scroll-reveal-group">
              <article className="journey-card journey-before"><div className="journey-card-top"><span className="journey-index">01 / {t('BEFORE')}</span><span className="journey-icon"><Icon name="file" size={21} /></span></div><h3>{t('Prepare')}<br />{t('with confidence.')}</h3><p>{t('Choose your service and see the requirements, expectations, and room numbers before you leave home.')}</p><a href="#find-service">{t('Find a service')} <Icon name="arrow" size={15} /></a><div className="journey-card-art art-checklist"><span /><i /><i /><i /><b><Icon name="check" size={16} /></b></div></article>
              <article className="journey-card journey-during"><div className="journey-card-top"><span className="journey-index">02 / {t('DURING')}</span><span className="journey-icon"><Icon name="route" size={21} /></span></div><h3>{t('Go straight')}<br />{t('to the right room.')}</h3><p>{t('Follow your step-by-step guide inside the bureau. Spend less time finding your way around.')}</p><a href="#service-guide">{t('See a sample route')} <Icon name="arrow" size={15} /></a><div className="journey-card-art art-route"><span>12</span><i /><span>14</span><i /><span>15</span></div></article>
              <article className="journey-card journey-after"><div className="journey-card-top"><span className="journey-index">03 / {t('AFTER')}</span><span className="journey-icon"><Icon name="heart" size={21} /></span></div><h3>{t('Share what')}<br />{t('you experienced.')}</h3><p>{t('Leave a complaint, suggestion, or satisfaction rating on the page or with an office QR code.')}</p><button type="button" onClick={goToFeedback}>{t('Share feedback')} <Icon name="arrow" size={15} /></button><div className="journey-card-art art-stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div></article>
            </div>
            <div className="qr-note scroll-reveal"><span className="qr-note-icon"><Icon name="qr" size={24} /></span><p><b>{t('Already at the bureau?')}</b> {t('Scan the office QR code to open the right feedback form in seconds.')}</p><button type="button" onClick={goToFeedback}>{t('Go to feedback')} <Icon name="arrow" size={15} /></button></div>
          </div>
        </section>

        <section className="news-section section-wrap" id="news">
          <div className="news-header scroll-reveal"><div><div className="section-kicker"><span>04</span> {t('FROM YOUR COMMUNITY')}</div><h2>{t('What’s happening')}<br /><em>{t('near you.')}</em></h2></div><div className="update-source"><Icon name="building" size={16} /> {t('Published by sub-city admins')}</div></div>
          <div className="news-grid scroll-reveal-group" id="news-cards">
            <article className="news-feature"><div className="news-photo"><div className="sun-disc" /><div className="city-silhouette"><span /><span /><span /><span /><span /><span /><span /></div><div className="news-photo-label"><Icon name="news" size={15} /> {t('COMMUNITY UPDATE')}</div></div><div className="news-meta"><span>{t('PUBLIC NOTICE')}</span><span>·</span><span>{t('EXAMPLE')}</span></div><h3>{t('Sub-city announcements, all in one place.')}</h3><p>{t('Find community updates and public notices shared by your local sub-city.')}</p></article>
            <article className="news-small-card"><div className="news-small-icon news-icon-green"><Icon name="calendar" size={20} /></div><div className="news-meta"><span>{t('UPCOMING EVENT')}</span><span>·</span><span>{t('EXAMPLE')}</span></div><h3>{t('Keep up with public events and service updates.')}</h3><p>{t('Important dates and announcements from your community, in one easy-to-find place.')}</p><div className="news-card-decoration decoration-lines" /></article>
            <article className="news-small-card news-small-dark"><div className="news-small-icon news-icon-gold"><Icon name="building" size={20} /></div><div className="news-meta"><span>{t('LOCAL SERVICES')}</span><span>·</span><span>{t('EXAMPLE')}</span></div><h3>{t('One guide to the services your bureau provides.')}</h3><p>{t('Understand what each office does and where to get the support you need.')}</p><div className="news-card-decoration decoration-circles" /></article>
          </div>
          <p className="sample-disclaimer news-disclaimer scroll-reveal">{t('News cards shown as layout examples. Official notices will be published by your local sub-city.')}</p>
        </section>

        <section className="feedback-section" id="feedback">
          <div className="feedback-backdrop" />
          <div className="feedback-layout section-wrap">
            <div className="feedback-copy scroll-reveal"><div className="section-kicker section-kicker-light"><span>05</span> {t('YOUR VOICE HELPS')}</div><h2>{t('Every experience')}<br />{t('can make things')} <em>{t('better.')}</em></h2><p>{t('Tell us how your visit went. Your feedback reaches the right bureau and helps improve services for everyone.')}</p><div className="feedback-points"><span><Icon name="shield" size={17} /> {t('No account needed')}</span><span><Icon name="qr" size={17} /> {t('Scan a bureau QR code')}</span></div><div className="feedback-quote"><span className="quote-mark">“</span><p>{t('Clear guidance before your visit. A simple way to be heard afterward.')}</p></div></div>
            <div className="feedback-form-card scroll-reveal">
              {!feedbackSubmitted ? <>
                <div className="feedback-form-heading"><div><span className="form-eyebrow">{t('CITIZEN FEEDBACK')}</span><h3>{t('Tell us about your visit')}</h3></div><span className="form-step-count">0{feedbackStep}<i> / 05</i></span></div>
                <div className="feedback-progress" aria-label={t(`STEP ${feedbackStep} OF 5`)}><span style={{ width: `${feedbackStep * 20}%` }} /></div>
                <div className="feedback-step-title"><span>{t(`STEP ${feedbackStep} OF 5`)}</span><h4>{t(['What would you like to share?', 'Which sub-city did you visit?', 'Which bureau did you visit?', 'What service did you receive?', 'Tell us a little more'][feedbackStep - 1])}</h4></div>
                <form onSubmit={submitFeedback}>
                  {feedbackStep === 1 && <div className="feedback-type-grid">{[
                    { value: 'Complaint', icon: 'news', label: 'A complaint', copy: 'Something needs attention' },
                    { value: 'Suggestion', icon: 'sparkle', label: 'A suggestion', copy: 'An idea for improvement' },
                    { value: 'Satisfaction', icon: 'heart', label: 'A rating', copy: 'Share how it went' },
                  ].map((item) => <button key={item.value} className={`feedback-type-option ${feedbackType === item.value ? 'selected' : ''}`} type="button" onClick={() => setFeedbackType(item.value)}><span className="type-option-icon"><Icon name={item.icon} size={19} /></span><span><b>{t(item.label)}</b><small>{t(item.copy)}</small></span>{feedbackType === item.value && <Icon name="check" size={16} className="type-option-check" />}</button>)}</div>}
                  {feedbackStep === 2 && <label className="feedback-select-label">{t('Select the sub-city')}<span className="feedback-select-wrap"><Icon name="pin" size={18} /><select value={feedbackCity} onChange={(event) => setFeedbackCity(event.target.value)}>{subCityOptions.map((name) => <option key={name} value={name}>{t(name)}</option>)}</select><Icon name="chevron" size={16} /></span></label>}
                  {feedbackStep === 3 && <label className="feedback-select-label">{t('Select the city office / bureau')}<span className="feedback-select-wrap"><Icon name="building" size={18} /><select value={feedbackBureau} onChange={(event) => changeBureau(event.target.value, true)}>{bureauOptions.map((bureau) => <option key={bureau.id} value={bureau.id}>{t(bureau.label)}</option>)}</select><Icon name="chevron" size={16} /></span></label>}
                  {feedbackStep === 4 && <label className="feedback-select-label">{t('Select the service')}<span className="feedback-select-wrap"><Icon name="file" size={18} /><select value={feedbackService} onChange={(event) => setFeedbackService(event.target.value)}>{activeFeedbackServiceList.map((service) => <option key={service.id} value={service.id}>{t(service.label)}</option>)}</select><Icon name="chevron" size={16} /></span></label>}
                  {feedbackStep === 5 && <div className="feedback-message-fields">{feedbackType === 'Satisfaction' && <fieldset className="rating-field"><legend>{t('How was your experience?')}</legend><div className="rating-options">{[1, 2, 3, 4, 5].map((rating) => <button key={rating} className={satisfaction === rating ? 'rating-selected' : ''} type="button" aria-label={`${rating} ${t('out of 5')}`} aria-pressed={satisfaction === rating} onClick={() => setSatisfaction(rating)}>★</button>)}</div>{!satisfaction && <small className="rating-hint">{t('Select a rating before submitting.')}</small>}</fieldset>}<label className="message-label" htmlFor="feedback-message">{t('Your feedback')}<textarea id="feedback-message" value={feedbackMessage} onChange={(event) => setFeedbackMessage(event.target.value)} placeholder={t('Share the details that could help improve your experience…')} required rows={4} /></label><p className="privacy-note"><Icon name="shield" size={15} /> {t('Please don’t include personal or sensitive information.')}</p></div>}
                  <div className="feedback-form-actions">{feedbackStep > 1 ? <button className="back-step-button" type="button" onClick={() => setFeedbackStep((step) => step - 1)}>{t('Back')}</button> : <span className="form-required-note">{t('Your feedback is anonymous')}</span>}{feedbackStep < 5 ? <button className="button button-primary form-next-button" type="button" onClick={nextFeedbackStep} disabled={feedbackStep === 1 && !feedbackType}>{t('Continue')} <Icon name="arrow" size={17} /></button> : <button className="button button-primary form-next-button" type="submit" disabled={!feedbackMessage.trim() || (feedbackType === 'Satisfaction' && !satisfaction)}>{t('Submit feedback')} <Icon name="arrow" size={17} /></button>}</div>
                </form>
                <div className="demo-note">{t('Interactive preview · Connect to your feedback system to receive submissions')}</div>
              </> : <div className="feedback-success" role="status"><span className="success-icon"><Icon name="check" size={27} /></span><span className="form-eyebrow">{t('THANK YOU FOR SPEAKING UP')}</span><h3>{t('Your voice matters.')}</h3><p>{t('This interactive preview has completed. Connect the form to your feedback system to securely route submissions to bureau admins.')}</p><button className="button button-secondary" type="button" onClick={() => { setFeedbackSubmitted(false); setFeedbackStep(1); setFeedbackType(''); setFeedbackMessage(''); setSatisfaction(0) }}>{t('Send another response')} <Icon name="arrow" size={16} /></button></div>}
              <div className="feedback-form-footer"><span><Icon name="shield" size={14} /> {t('Your privacy is important')}</span><span>{t(`STEP ${feedbackStep} OF 5`)}</span></div>
            </div>
          </div>
        </section>

        <section className="admin-strip section-wrap scroll-reveal"><div className="admin-strip-icon"><Icon name="building" size={23} /></div><div><span className="admin-strip-kicker">{t('FOR PUBLIC SERVICE TEAMS')}</span><h3>{t('Manage information where it belongs.')}</h3><p>{t('Sub-city and bureau admins keep service guides, room routes, news, and feedback up to date.')}</p></div><div className="admin-strip-roles"><span>{t('SUPER ADMIN')}</span><i /> <span>{t('SUB-CITY')}</span><i /> <span>{t('BUREAU')}</span></div></section>
      </main>

      <footer className="site-footer"><div className="footer-main section-wrap scroll-reveal-group"><a className="brand footer-brand" href="#top"><BrandMark /><span className="brand-copy"><strong>Civic<span>Link</span></strong><small>{t('ETHIOPIA · CITIZEN SERVICES')}</small></span></a><p>{t('Clearer information for every visit.')}<br />{t('A more responsive public service.')}</p><div className="footer-nav"><a href="#find-service">{t('Find a service')}</a><a href="#how-it-works">{t('How it works')}</a><a href="#news">{t('News & events')}</a><a href="#feedback">{t('Share feedback')}</a></div></div><div className="footer-bottom section-wrap scroll-reveal"><span>{t('© 2026 CivicLink Ethiopia · Public service information platform')}</span><span>{t('Built for citizens, maintained by bureaus.')}</span></div></footer>
    </div>
  )
}

export default App
