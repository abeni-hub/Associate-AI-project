<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\News\Models\News;
use App\Domains\Organizations\Models\Organization;
use Illuminate\Database\Seeder;

class NewsSeeder extends Seeder
{
    /**
     * Seed sample news articles with realistic multilingual content blocks.
     */
    public function run(): void
    {
        $boleOrg = Organization::where('code', 'bole-subcity')->first() ?: Organization::first();
        $tradeOrg = Organization::where('code', 'trade-industry-bureau')->first() ?: $boleOrg;
        $civilOrg = Organization::where('code', 'civil-registration-agency')->first() ?: $boleOrg;

        if (! $boleOrg) {
            return;
        }

        $newsItems = [
            [
                'org_id' => $boleOrg->id,
                'title' => 'Expansion of Digital Citizen Service Counters Across Bole and Yeka Sub-Cities',
                'p1_en' => 'The Addis Ababa City Administration has completed the rollout of dedicated digital service desks at municipal woreda branches. The desks feature dual-screen biometric verification and streamlined appointment booking.',
                'p1_am' => 'የአዲስ አበባ ከተማ አስተዳደር በወረዳ ቅርንጫፎች የተሟሉ የዲጂታል አገልግሎት መስጫ መስኮቶችን የማደራጀት ስራ አጠናቋል። መስኮቶቹ ባለ ሁለት ስክሪን የባዮሜትሪክ ማረጋገጫ እና የተቀላጠፈ የቀጠሮ ማስያዣ ስርዓት ተገጥሞላቸዋል።',
                'p1_om' => 'Bulchiinsi Magaalaa Finfinnee waajjiraalee aanaalee keessatti minjaalota tajaajila dijitaalaa ammayyeessuu xumureera. Minjaalonni kun sirna mirkaneessa bayoomeetiriksii iskiriinii lamaa fi qabannaa beellamaa saffisaa qabu.',
                'p2_en' => 'Citizens are encouraged to utilize their Fayda Digital National ID for expedited 10-minute turnaround times across vital registrations, trade renewals, and tenancy contracts.',
                'p2_am' => 'ዜጎች ለወሳኝ ኩነቶች፣ ለንግድ ፈቃድ እድሳት እና ለኪራይ ውል ምዝገባ በ10 ደቂቃ ውስጥ ፈጣን አገልግሎት ለማግኘት የፋይዳ ብሔራዊ መታወቂያቸውን እንዲጠቀሙ ተጋብዘዋል።',
                'p2_om' => 'Lammiileen tajaajiloota galmee murteessoo, haaromsa daldalaa fi waliigaltee kireeffannaa daqiiqaa 10 keessatti saffisaan xumuruuf Waraqaa Eenyummaa Faayidaa akka fayyadaman gorfamu.',
            ],
            [
                'org_id' => $tradeOrg->id,
                'title' => 'Annual Business License Electronic Renewal Deadline Announced for 2026 Fiscal Year',
                'p1_en' => 'The Trade & Industry Development Bureau has published the statutory calendar for commercial trade license renewals. All business proprietors can submit financial statements and tax clearance certificates online.',
                'p1_am' => 'የንግድና ኢንዱስትሪ ልማት ቢሮ የንግድ ፈቃድ እድሳት ህጋዊ የቀን መቁጠሪያ ይፋ አድርጓል። ሁሉም የንግድ ባለቤቶች የሂሳብ መግለጫዎችን እና የታክስ ክሊራንስ ሰነዶችን በበይነመረብ ማስገባት ይችላሉ።',
                'p1_om' => 'Biiroon Misooma Daldalaa fi Industirii kalendarii seeraa haaromsa hayyama daldalaa ifa godheera. Abbootiin qabeenyaa daldalaa hundi ibsa herregaa fi waraqaa ragaa qulqullina gibiraa sarara irraan dhiyeessuu dandeessu.',
                'p2_en' => 'Support kiosks have been deployed at chamber of commerce buildings to assist small-scale retailers with online fee settlement and barcode certificate generation.',
                'p2_am' => 'አነስተኛ ነጋዴዎችን በዲጂታል ክፍያና በባርኮድ የተረጋገጠ ሰርተፍኬት አወጣጥ ላይ ለማገዝ በንግድ ምክር ቤት ህንፃዎች የድጋፍ መስኮቶች ተቋቁመዋል።',
                'p2_om' => 'Daldaltoota xixiqqoo kaffaltii dijitaalaa fi waraqaa ragaa baarkoodii qabu baafachuu irratti gargaaruuf gamoo manneen marii daldalaa keessatti bakkeewwan deeggarsaa hundeeffamaniiru.',
            ],
            [
                'org_id' => $civilOrg->id,
                'title' => 'Modernized Vital Statistics & Resident ID Certification Center Inaugurated',
                'p1_en' => 'A centralized municipal archive and authentication hall was officially commissioned today. The facility handles archived birth, marriage, and death records dating back to 1980 with authenticated digital verification.',
                'p1_am' => 'ማዕከላዊ የማዘጋጃ ቤት ማህደር እና የማረጋገጫ አዳራሽ በይፋ ስራ ጀመረ። ተቋሙ ከ1980 ጀምሮ የተመዘገቡ የልደት፣ የጋብቻ እና የሞት ሰነዶችን በዲጂታል ቴክኖሎጂ አረጋግጦ ይሰጣል።',
                'p1_om' => 'Giddugalli kuusaa ragaalee fi mirkaneessaa masaraa magaalaa har\'a eebbifameera. Dhaabbanni kun ragaalee dhalootaa, gaa\'elaa fi du\'aa bara 1980 irraa eegale kuufaman teeknooloojiin mirkaneessee kenna.',
                'p2_en' => 'New automated QR certificates reduce replacement verification from multiple days to less than 30 minutes for citizens presenting valid identification.',
                'p2_am' => 'አዲሱ የQR ኮድ ሰርተፍኬት ህጋዊ መታወቂያ ላላቸው ዜጎች የምትክ ሰነድ ማረጋገጫ ጊዜን ከቀናት ወደ 30 ደቂቃ ዝቅ አድርጎታል።',
                'p2_om' => 'Waraqaan ragaa koodii QR haaraan kun lammiilee waraqaa eenyummaa seera qabeessa qabaniif yeroo mirkaneessa bakka buusaa guyyoota hedduu irraa gara daqiiqaa 30 gadiitti gabaabseera.',
            ],
        ];

        foreach ($newsItems as $item) {
            $news = News::create([
                'organization_id' => $item['org_id'],
                'news_title' => $item['title'],
            ]);

            $news->contents()->create([
                'content' => $item['p1_en'],
                'content_amh' => $item['p1_am'],
                'content_oro' => $item['p1_om'],
                'content_type' => 'text',
                'order' => 1,
            ]);

            $news->contents()->create([
                'content' => $item['p2_en'],
                'content_amh' => $item['p2_am'],
                'content_oro' => $item['p2_om'],
                'content_type' => 'text',
                'order' => 2,
            ]);
        }
    }
}
