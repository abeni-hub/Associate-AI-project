<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RichPortalSeedData extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // 1. Seed Citizen Feedbacks
        $feedbacks = [
            [
                'org_id' => 8, // Civil Registration
                'type' => 'complaint',
                'status' => 'under_review',
                'full_name' => 'Almaz Tadesse',
                'phone' => '+251911234567',
                'content_en' => 'Waiting queue at counter 4 exceeded 2 hours for birth certificate copy collection. More staff needed during morning rush hours.',
                'content_am' => 'በመስኮት 4 የልደት ምስክር ወረቀት ቅጂ ለመውሰድ ከ2 ሰዓታት በላይ ተሰልፌ ቆይቻለሁ። በጠዋት ሰዓታት ተጨማሪ ሠራተኞች ያስፈልጋሉ።',
                'content_om' => 'Koppii waraqaa ragaa dhalootaa fudhachuuf foddaa 4ffaa irratti sa\'aatii 2 ol hiriiree ture. Sa\'aatii ganamaa hojjettoota dabalataa barbaachisa.',
                'tracking' => 'TK-92811',
                'days_ago' => 1,
                'response' => 'Thank you for reporting. Additional verification counters have been deployed from 8:30 AM to 11:30 AM.',
                'resolved' => false,
            ],
            [
                'org_id' => 1, // Bole Sub-city
                'type' => 'satisfaction',
                'status' => 'resolved',
                'full_name' => 'Dawit Bekele',
                'phone' => '+251922345678',
                'content_en' => 'Excellent and speedy service for national ID replacement. The counter agent was courteous and helpful.',
                'content_am' => 'ለብሔራዊ መታወቂያ ምትክ እጅግ በጣም ፈጣን እና ቀልጣፋ አገልግሎት። የመስኮት ሠራተኛው በጣም ትሁት እና ተባባሪ ነበሩ።',
                'content_om' => 'Bakka buusaa waraqaa eenyummaa biyyaalessaaf tajaajila baay\'ee saffisaa fi gaarii. Hojjetaan fuula duraa kabaja qaba ture.',
                'tracking' => 'TK-92812',
                'days_ago' => 2,
                'response' => 'Thank you for your encouraging feedback! We strive to maintain this standard.',
                'resolved' => true,
            ],
            [
                'org_id' => 11, // Land Development
                'type' => 'complaint',
                'status' => 'submitted',
                'full_name' => 'Hiwot Mengistu',
                'phone' => '+251933456789',
                'content_en' => 'Title deed cadastral verification file transfer has been pending for over 10 days without status update on the portal.',
                'content_am' => 'የካዳስተር ማረጋገጫ ፋይል ዝውውር በፖርታሉ ላይ ምንም ዓይነት የሂደት መረጃ ሳይሰጥ ከ10 ቀናት በላይ ዘግይቷል።',
                'content_om' => 'Dabarsaan faayila mirkaneessa kaadaastaraa guyyoota 10 oliif odeeffannoo haaromaa malee tureera.',
                'tracking' => 'TK-92813',
                'days_ago' => 0,
                'response' => null,
                'resolved' => false,
            ],
            [
                'org_id' => 9, // Revenues Bureau
                'type' => 'feedback',
                'status' => 'resolved',
                'full_name' => 'Yonas Tesfaye',
                'phone' => '+251944567890',
                'content_en' => 'Digital payment confirmation via Telebirr was smooth, but physical stamp receipt collection still required waiting.',
                'content_am' => 'በቴሌብር የዲጂታል ክፍያ ማረጋገጫው ፈጣን ነበር፤ ነገር ግን ማህተም የተደረገበት ደረሰኝ ለመውሰድ አሁንም ወረፋ አለ።',
                'content_om' => 'Kaffaltiin dijitaalaa Telebirr nagaa ture, garuu nagahee chaappaa fudhachuuf ammallee hiriirri jira.',
                'tracking' => 'TK-92814',
                'days_ago' => 3,
                'response' => 'Digital receipt with QR verification is now accepted directly without needing manual stamping.',
                'resolved' => true,
            ],
            [
                'org_id' => 10, // Trade & Industry
                'type' => 'satisfaction',
                'status' => 'resolved',
                'full_name' => 'Bethlehem Abebe',
                'phone' => '+251955678901',
                'content_en' => 'Business license annual renewal was completed in 15 minutes! The new electronic workflow is a huge improvement.',
                'content_am' => 'የንግድ ፈቃድ ዓመታዊ እድሳት በ15 ደቂቃ ውስጥ ተጠናቀቀ! አዲሱ ኤሌክትሮኒክ አሰራር ትልቅ መሻሻል አሳይቷል።',
                'content_om' => 'Haaromsi hayyama daldalaa daqiiqaa 15 keessatti xumurame! Hojimaanni elektirooniksii haaraan fooyya\'iinsa guddaadha.',
                'tracking' => 'TK-92815',
                'days_ago' => 4,
                'response' => 'We are glad the new automated renewal process met your expectations!',
                'resolved' => true,
            ],
            [
                'org_id' => 5, // Kirkos Sub-city
                'type' => 'complaint',
                'status' => 'under_review',
                'full_name' => 'Ermias Getachew',
                'phone' => '+251966789012',
                'content_en' => 'The information screen at the entrance was offline and citizens were confused about which room to visit for building permits.',
                'content_am' => 'መግቢያው ላይ ያለው የመረጃ ማሳያ ማያ ገጽ ጠፍቶ ስለነበር ዜጎች ለግንባታ ፈቃድ የትኛውን ክፍል መጎብኘት እንዳለባቸው ተቸግረው ነበር።',
                'content_om' => 'Iskiriiniin odeeffannoo balbala dura jiru cufamee waan tureef lammiileen hayyama ijaarsaaf gara kam deemuu akka qaban burjaaja\'anii turan.',
                'tracking' => 'TK-92816',
                'days_ago' => 2,
                'response' => 'IT maintenance team dispatched; screen replaced and room directory printed at entrance.',
                'resolved' => false,
            ],
            [
                'org_id' => 6, // Yeka Sub-city
                'type' => 'satisfaction',
                'status' => 'resolved',
                'full_name' => 'Rahel Solomon',
                'phone' => '+251977890123',
                'content_en' => 'Very organized desk for elderly and pregnant citizens at Woreda 03 service branch. Commendable hospitality.',
                'content_am' => 'በወረዳ 03 ቅርንጫፍ ለአረጋውያንና ለነፍሰጡር እናቶች የተዘጋጀው የተለየ መስኮት በጣም የተደራጀ ነበር። የሚያስመሰግን መስተንግዶ።',
                'content_om' => 'Waajjira tajaajilaa Ganda 03tti maanguddootaa fi haadholii ulfaatiif fooyyee qophaa\'e baay\'ee qindaa\'aa ture.',
                'tracking' => 'TK-92817',
                'days_ago' => 5,
                'response' => 'Thank you for your commendation. Inclusive accessibility is our top priority.',
                'resolved' => true,
            ],
            [
                'org_id' => 7, // Arada Sub-city
                'type' => 'feedback',
                'status' => 'submitted',
                'full_name' => 'Kibrom Berhane',
                'phone' => '+251988901234',
                'content_en' => 'Please consider extending evening service hours on Wednesdays for working professionals who cannot visit during work hours.',
                'content_am' => 'በስራ ሰዓት መምጣት ለማይችሉ ሰራተኞች እባክዎን ረቡዕ ዕለት የምሽት አገልግሎት ሰዓትን ለማራዘም ያስቡበት።',
                'content_om' => 'Lammiilee sa\'aatii hojiitti dhufuu hin dandeenyeef maaloo sa\'aatii tajaajila galgalaa Roobii akka dheeressitan yaada dhiyeessa.',
                'tracking' => 'TK-92818',
                'days_ago' => 1,
                'response' => null,
                'resolved' => false,
            ],
            [
                'org_id' => 12, // Urban Planning
                'type' => 'complaint',
                'status' => 'under_review',
                'full_name' => 'Mulugeta Assefa',
                'phone' => '+251911345678',
                'content_en' => 'Architectural review submission portal showed upload size error for files under 15MB. Error message needs to be clearer.',
                'content_am' => 'የስነ-ህንፃ ግምገማ ሰነድ መጫኛ ፖርታል ከ15 ሜጋባይት በታች ለሆኑ ፋይሎች የስህተት መልዕክት አሳይቷል። የስህተት መልዕክቱ ግልጽ መሆን አለበት።',
                'content_om' => 'Portaaliin galmee ijaarsaa faayiloota 15MB gadii irratti dogoggora agarsiise. Ergaan dogoggoraa ifa ta\'uu qaba.',
                'tracking' => 'TK-92819',
                'days_ago' => 3,
                'response' => 'Upload threshold adjusted to 50MB and informative progress indicator implemented.',
                'resolved' => false,
            ],
            [
                'org_id' => 2, // Nifas Silk
                'type' => 'satisfaction',
                'status' => 'resolved',
                'full_name' => 'Sara Mohammed',
                'phone' => '+251922456789',
                'content_en' => 'Residential tenancy registration went smoothly without any bureaucratic obstacles. Staff was very helpful.',
                'content_am' => 'የመኖሪያ ቤት ኪራይ ውል ምዝገባ ያለምንም ቢሮክራሲያዊ እንቅፋት በተሳካ ሁኔታ ተጠናቀቀ። ሠራተኞቹ በጣም አጋዥ ነበሩ።',
                'content_om' => 'Galmeen kireeffannaa mana jireenyaa gufuu tokko malee nagaan xumurame. Hojjettoonni gargaarsa gaarii taasisaniiru.',
                'tracking' => 'TK-92820',
                'days_ago' => 6,
                'response' => 'Thank you for your valuable feedback!',
                'resolved' => true,
            ],
        ];

        foreach ($feedbacks as $fb) {
            $created = $now->copy()->subDays($fb['days_ago'])->subHours(rand(1, 10));
            $resolvedAt = $fb['resolved'] ? $created->copy()->addHours(rand(4, 24)) : null;

            // Check if tracking number already exists
            $exists = DB::table('feedbacks')->where('tracking_number', $fb['tracking'])->exists();
            if (! $exists) {
                DB::table('feedbacks')->insert([
                    'feedback_for_organization' => $fb['org_id'],
                    'feedback_type' => $fb['type'],
                    'feedback_content' => $fb['content_en'],
                    'feedback_content_amh' => $fb['content_am'],
                    'feedback_content_oro' => $fb['content_om'],
                    'full_name' => $fb['full_name'],
                    'phone_number' => $fb['phone'],
                    'status' => $fb['status'],
                    'response' => $fb['response'],
                    'tracking_number' => $fb['tracking'],
                    'resolved_at' => $resolvedAt,
                    'created_at' => $created,
                    'updated_at' => $resolvedAt ?: $created,
                ]);
            }
        }

        // 2. Seed Rich Audit Activity Logs for 7-day Dashboard Activity Chart
        $auditTemplates = [
            ['action' => 'service.published', 'entity' => 'Service', 'desc' => 'Published citizen service standard: Resident ID Issuance', 'category' => 'Services'],
            ['action' => 'service.updated', 'entity' => 'Service', 'desc' => 'Updated fee structure and required documents for Trade License', 'category' => 'Services'],
            ['action' => 'feedback.resolved', 'entity' => 'Feedback', 'desc' => 'Resolved citizen grievance #TK-92812 with official resolution notice', 'category' => 'Citizen voice'],
            ['action' => 'feedback.in_review', 'entity' => 'Feedback', 'desc' => 'Assigned complaint #TK-92811 to Bole Sub-city verification desk', 'category' => 'Citizen voice'],
            ['action' => 'user.login', 'entity' => 'User', 'desc' => 'Administrative user authenticated successfully', 'category' => 'Security & access'],
            ['action' => 'organization.updated', 'entity' => 'Organization', 'desc' => 'Updated service hours and administrative desk contacts', 'category' => 'Offices'],
            ['action' => 'document.created', 'entity' => 'Document', 'desc' => 'Cataloged new citizen requirement: Authenticated Power of Attorney', 'category' => 'Services'],
            ['action' => 'news.published', 'entity' => 'News', 'desc' => 'Published municipal public announcement: Annual Business License Campaign', 'category' => 'CMS & Landing'],
            ['action' => 'qr.generated', 'entity' => 'QrCode', 'desc' => 'Generated dynamic feedback QR access token for Desk #4', 'category' => 'Offices'],
            ['action' => 'role.updated', 'entity' => 'Role', 'desc' => 'Updated role access permissions for Sub-city Desk Admin', 'category' => 'Roles & access'],
        ];

        $firstUserId = DB::table('users')->value('id');

        // Seed 5-8 activities per day for the last 7 days
        for ($day = 6; $day >= 0; $day--) {
            $dayCount = rand(4, 9);
            for ($k = 0; $k < $dayCount; $k++) {
                $tpl = $auditTemplates[array_rand($auditTemplates)];
                $time = $now->copy()->subDays($day)->setHour(rand(8, 17))->setMinute(rand(0, 59));

                DB::table('audit_logs')->insert([
                    'user_id' => $firstUserId,
                    'action' => $tpl['action'],
                    'entity_type' => $tpl['entity'],
                    'entity_id' => (string) rand(10, 99),
                    'status' => 'success',
                    'status_code' => 200,
                    'request_payload' => json_encode(['summary' => $tpl['desc'], 'category' => $tpl['category']]),
                    'response_payload' => json_encode(['status' => 'success']),
                    'old_values' => json_encode(['status' => 'draft', 'version' => 1]),
                    'new_values' => json_encode(['status' => 'published', 'version' => 2]),
                    'ip_address' => '127.0.0.1',
                    'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) CivicLink/Portal',
                    'created_at' => $time,
                ]);
            }
        }
    }
}
