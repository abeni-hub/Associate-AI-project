<?php

declare(strict_types=1);

namespace App\Domains\Cms\Support;

class DefaultLandingPageContent
{
    /**
     * Get the complete default 8-section landing page CMS configuration.
     *
     * @return array<string, mixed>
     */
    public static function payload(): array
    {
        return [
            'announcement' => [
                'enabled' => true,
                'tag' => 'PUBLIC NOTICE',
                'message' => 'Public services operate under standard working hours. Please prepare required documents before visiting bureaus.',
                'linkText' => 'Explore the guide',
                'linkUrl' => '#guide',
            ],
            'hero' => [
                'badge' => 'ETHIOPIA · CITIZEN SERVICES',
                'titleEn' => 'One clear place to plan your next public service visit',
                'titleAm' => 'ለሚቀጥለው የመንግሥት አገልግሎት ጉብኝትዎ የሚያስፈልግዎትን ሁሉ በአንድ ቦታ',
                'subtitleEn' => 'The right information makes every visit easier. Find your service, prepare your documents, and know exactly where to go before you leave home.',
                'subtitleAm' => 'ትክክለኛ መረጃ ጉብኝትዎን ቀላል ያደርገዋል። የሚፈልጉትን አገልግሎት ይምረጡ፣ ሰነዶችዎን ያዘጋጁ፣ ከቤት ከመውጣትዎ በፊትም ወዴት እንደሚሄዱ በትክክል ይወቁ።',
                'primaryCtaText' => 'Find a service',
                'primaryCtaUrl' => '#guide',
                'secondaryCtaText' => "I've already visited",
                'secondaryCtaUrl' => '#feedback',
                'slides' => [
                    [
                        'id' => 1,
                        'title' => 'Revenue services, made clearer.',
                        'bureau' => 'REVENUE BUREAU',
                        'category' => 'Revenue & Tax',
                        'image' => 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Local_government_building%2C_Yeka_Subcity%2C_Addis_Ababa.jpg/1280px-Local_government_building%2C_Yeka_Subcity%2C_Addis_Ababa.jpg',
                        'alt' => 'Local government office building in Yeka Subcity, Addis Ababa.',
                        'credit' => 'Yeka Subcity Office · Mjr74 (CC BY 4.0)',
                        'source' => 'https://commons.wikimedia.org/wiki/File:Local_government_building,_Yeka_Subcity,_Addis_Ababa.jpg',
                        'tint' => '#164d58',
                    ],
                    [
                        'id' => 2,
                        'title' => "A better view of what's next.",
                        'bureau' => 'PLANNING & DEVELOPMENT',
                        'category' => 'Planning',
                        'image' => 'https://mopd.gov.et/media/492570380_994507082831520_8549139107595449985_n.jpg',
                        'alt' => "Officials meet at Ethiopia's Ministry of Planning and Development.",
                        'credit' => 'Ministry of Planning & Development',
                        'source' => 'https://mopd.gov.et/',
                        'tint' => '#365b63',
                    ],
                    [
                        'id' => 3,
                        'title' => 'The right documents. The right place.',
                        'bureau' => 'CIVIL REGISTRATION',
                        'category' => 'Civil Registration',
                        'image' => 'https://aacrrsa.gov.et/uploads/Blog/662a29f023bf6.438697344_821273923352047_6926469178446352208_n.jpg',
                        'alt' => 'The Addis Ababa Civil Registration and Residency Service Agency lobby.',
                        'credit' => 'Civil Registration & Residency Service Agency',
                        'source' => 'https://aacrrsa.gov.et/',
                        'tint' => '#3b625e',
                    ],
                    [
                        'id' => 4,
                        'title' => 'Find your way through land services.',
                        'bureau' => 'LAND ADMINISTRATION',
                        'category' => 'Land & Property',
                        'image' => 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Lemikurasubcityworeda08.jpg',
                        'alt' => 'Lemi Kura Woreda 08 local government office in Addis Ababa.',
                        'credit' => 'Lemi Kura Woreda 08 · Khajitdadddy (CC BY-SA 4.0)',
                        'source' => 'https://commons.wikimedia.org/wiki/File:Lemikurasubcityworeda08.jpg',
                        'tint' => '#536458',
                    ],
                ],
            ],
            'quickSearch' => [
                'enabled' => true,
                'kicker' => 'START HERE',
                'kickerNum' => '01',
                'title' => 'What do you need help with?',
                'subtitle' => 'Choose a location and service to see your visit guide.',
                'buttonText' => 'Show my guide',
                'footnoteText' => 'Takes less than a minute · No account needed',
            ],
            'serviceGuide' => [
                'enabled' => true,
                'kicker' => 'YOUR VISIT GUIDE',
                'kickerNum' => '02',
                'titleLead' => 'A clearer path,',
                'titleEmphasis' => 'step by step.',
                'description' => 'Know what to bring and which room to visit, before you set off. The sample guide below shows how service details will appear.',
                'sampleBadgeText' => 'SAMPLE GUIDE',
                'whatToBringTitle' => 'What to bring',
                'expectationsNote' => 'Bring original documents where available. Ask the bureau if requirements have changed.',
                'routeHeading' => 'Your room-by-room route',
                'disclaimerText' => 'Service information can change. Confirm with your bureau if you are unsure. Illustrative example only. Bureaus will publish and maintain official requirements and room numbers in the live system.',
            ],
            'journey' => [
                'enabled' => true,
                'kicker' => 'SIMPLE FROM START TO FINISH',
                'kickerNum' => '03',
                'title' => 'Three moments. One smoother journey.',
                'steps' => [
                    [
                        'step' => '01 / BEFORE',
                        'title' => 'Prepare with confidence',
                        'detail' => 'Choose your service and see the requirements, expectations, and room numbers before you leave home.',
                    ],
                    [
                        'step' => '02 / DURING',
                        'title' => 'Go straight to the right room',
                        'detail' => 'Follow your step-by-step guide inside the bureau. Spend less time finding your way around.',
                    ],
                    [
                        'step' => '03 / AFTER',
                        'title' => 'Share what you experienced',
                        'detail' => 'Leave a complaint, suggestion, or satisfaction rating on the page or with an office QR code.',
                    ],
                ],
            ],
            'newsEvents' => [
                'enabled' => true,
                'kicker' => 'FROM YOUR COMMUNITY',
                'kickerNum' => '04',
                'title' => "What's happening near you.",
                'sourceLabel' => 'Published by sub-city admins',
                'showEvents' => true,
                'showNews' => true,
                'viewAllText' => 'View all community updates',
                'emptyMessage' => 'No active announcements at this time.',
            ],
            'feedback' => [
                'enabled' => true,
                'kicker' => 'YOUR VOICE HELPS',
                'kickerNum' => '05',
                'title' => 'Every experience can make things better.',
                'description' => 'Tell us how your visit went. Your feedback reaches the right bureau and helps improve services for everyone.',
                'pointOne' => 'Scan a bureau QR code to route feedback directly to desk supervisors.',
                'pointTwo' => 'Clear guidance before your visit. A simple way to be heard afterward.',
                'quote' => 'Clearer information for every visit. A more responsive public service.',
            ],
            'footer' => [
                'enabled' => true,
                'brandTagline' => 'Clearer information for every visit. A more responsive public service.',
                'description' => "Built for citizens, maintained by bureaus across Ethiopia's sub-cities and woredas.",
                'adminStripKicker' => 'FOR PUBLIC SERVICE TEAMS',
                'adminStripTitle' => 'Manage information where it belongs.',
                'adminStripDescription' => 'Sub-city and bureau admins keep service guides, room routes, news, and feedback up to date.',
                'copyright' => '© 2026 CivicLink Ethiopia · Public service information platform',
                'bottomNote' => 'Official citizen engagement & service delivery portal.',
                'helplinePhone' => '7533',
            ],
        ];
    }
}
