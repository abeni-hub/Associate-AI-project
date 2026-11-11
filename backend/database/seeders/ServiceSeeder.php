<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Documents\Models\Document;
use App\Domains\Organizations\Models\Organization;
use App\Domains\Organizations\Models\OrganizationType;
use App\Domains\Services\Models\Service;
use App\Domains\Services\Models\ServiceStep;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds for municipal services, subservices, steps, documents, and bureaus.
     */
    public function run(): void
    {
        DB::transaction(function () {
            // 0. Clean up dummy placeholder services if present
            Service::withTrashed()->where('code', 'ser')->forceDelete();

            // 1. Ensure Organization Types
            $subCityType = OrganizationType::firstOrCreate(
                ['code' => 'sub_city'],
                [
                    'name' => 'Sub-city',
                    'description' => 'Sub-city administration branch of Addis Ababa',
                    'level' => 1,
                    'can_be_root' => true,
                    'is_active' => true,
                ]
            );

            $bureauType = OrganizationType::firstOrCreate(
                ['code' => 'bureau'],
                [
                    'name' => 'Bureau / Agency',
                    'description' => 'Municipal executive bureau or agency administering public services',
                    'level' => 1,
                    'can_be_root' => true,
                    'is_active' => true,
                ]
            );

            // 2. Ensure Key Sub-cities (for citizen location filtering)
            $subCities = [
                'bole-subcity' => [
                    'name' => 'Bole Sub-city',
                    'code' => 'bole-subcity',
                    'address' => 'Bole Medhanealem, Addis Ababa',
                    'phone' => '+251 11 662 0001',
                    'email' => 'bole@addisababa.gov.et',
                    'organization_type_id' => $subCityType->id,
                    'status' => 'active',
                ],
                'nifas-silk' => [
                    'name' => 'Nifas Silk-Lafto Sub-city',
                    'code' => 'nifas-silk',
                    'address' => 'Gotera / Saris, Addis Ababa',
                    'phone' => '+251 11 442 0002',
                    'email' => 'nifassilk@addisababa.gov.et',
                    'organization_type_id' => $subCityType->id,
                    'status' => 'active',
                ],
                'kirkos-subcity' => [
                    'name' => 'Kirkos Sub-city',
                    'code' => 'kirkos-subcity',
                    'address' => 'Meskel Square, Addis Ababa',
                    'phone' => '+251 11 551 0003',
                    'email' => 'kirkos@addisababa.gov.et',
                    'organization_type_id' => $subCityType->id,
                    'status' => 'active',
                ],
                'yeka-subcity' => [
                    'name' => 'Yeka Sub-city',
                    'code' => 'yeka-subcity',
                    'address' => 'Megenagna, Addis Ababa',
                    'phone' => '+251 11 646 0004',
                    'email' => 'yeka@addisababa.gov.et',
                    'organization_type_id' => $subCityType->id,
                    'status' => 'active',
                ],
                'arada-subcity' => [
                    'name' => 'Arada Sub-city',
                    'code' => 'arada-subcity',
                    'address' => 'Piazza / Churchill Ave, Addis Ababa',
                    'phone' => '+251 11 155 0005',
                    'email' => 'arada@addisababa.gov.et',
                    'organization_type_id' => $subCityType->id,
                    'status' => 'active',
                ],
            ];

            $seededSubCities = [];
            foreach ($subCities as $code => $data) {
                $seededSubCities[$code] = Organization::updateOrCreate(['code' => $code], $data);
            }

            // 3. Ensure Key Municipal Bureaus / Agencies
            $bureaus = [
                'civil-registration-agency' => [
                    'name' => 'Civil Registration & Residency Service Agency',
                    'code' => 'civil-registration-agency',
                    'description' => 'Vital statistics, resident ID, birth, marriage, and death record administration.',
                    'address' => 'Municipal Head Office, Churchill Avenue, Addis Ababa',
                    'phone' => '+251 11 155 1200',
                    'email' => 'civil.registry@addisababa.gov.et',
                    'organization_type_id' => $bureauType->id,
                    'status' => 'active',
                ],
                'revenues-bureau' => [
                    'name' => 'Addis Ababa Revenues Bureau',
                    'code' => 'revenues-bureau',
                    'description' => 'Tax administration, digital TIN issuance, business income assessment, and tax clearance.',
                    'address' => 'Revenues Tower, Stadium Area, Addis Ababa',
                    'phone' => '+251 11 552 2300',
                    'email' => 'revenues@addisababa.gov.et',
                    'organization_type_id' => $bureauType->id,
                    'status' => 'active',
                ],
                'trade-industry-bureau' => [
                    'name' => 'Trade & Industry Development Bureau',
                    'code' => 'trade-industry-bureau',
                    'description' => 'Business licensing, commercial registration, annual renewals, and trade regulation.',
                    'address' => 'Trade Center, Mexico Square, Addis Ababa',
                    'phone' => '+251 11 551 3400',
                    'email' => 'trade@addisababa.gov.et',
                    'organization_type_id' => $bureauType->id,
                    'status' => 'active',
                ],
                'land-development-bureau' => [
                    'name' => 'Land Development & Administration Bureau',
                    'code' => 'land-development-bureau',
                    'description' => 'Cadastral surveying, plot boundaries, lease tenders, and title deed transfers.',
                    'address' => 'Land Administration Tower, Kazanchis, Addis Ababa',
                    'phone' => '+251 11 553 4500',
                    'email' => 'land.admin@addisababa.gov.et',
                    'organization_type_id' => $bureauType->id,
                    'status' => 'active',
                ],
                'urban-planning-bureau' => [
                    'name' => 'Urban Planning & Construction Permit Bureau',
                    'code' => 'urban-planning-bureau',
                    'description' => 'Architectural design compliance, building construction permits, and structural plan reviews.',
                    'address' => 'Urban Center, Ras Abebe Aregay Ave, Addis Ababa',
                    'phone' => '+251 11 554 5600',
                    'email' => 'urban.planning@addisababa.gov.et',
                    'organization_type_id' => $bureauType->id,
                    'status' => 'active',
                ],
            ];

            $seededBureaus = [];
            foreach ($bureaus as $code => $data) {
                $seededBureaus[$code] = Organization::updateOrCreate(['code' => $code], $data);
            }

            // 4. Ensure Prerequisite Documents
            $documentsData = [
                'DOC-RES-ID' => [
                    'name' => 'Resident ID Card / Fayda Digital ID',
                    'code' => 'DOC-RES-ID',
                    'description' => 'Valid municipal Kebele identification card or verified Fayda National ID.',
                    'is_active' => true,
                ],
                'DOC-BIRTH-NOTIF' => [
                    'name' => 'Official Birth Notification Paper (from Health Facility)',
                    'code' => 'DOC-BIRTH-NOTIF',
                    'description' => 'Stamped birth notification issued by an accredited hospital or health center.',
                    'is_active' => true,
                ],
                'DOC-MARR-CERT' => [
                    'name' => 'Marriage Certificate / Witness Identification',
                    'code' => 'DOC-MARR-CERT',
                    'description' => 'Official marriage certificate or registered identification of both marriage witnesses.',
                    'is_active' => true,
                ],
                'DOC-DEATH-NOTIF' => [
                    'name' => 'Medical Death Notice / Hospital Confirmation',
                    'code' => 'DOC-DEATH-NOTIF',
                    'description' => 'Certified medical certificate of death signed and stamped by an authorized physician.',
                    'is_active' => true,
                ],
                'DOC-PASSPORT-PHOTO' => [
                    'name' => 'Recent Passport-Sized Photographs (3x4 cm)',
                    'code' => 'DOC-PASSPORT-PHOTO',
                    'description' => 'Color passport photographs taken within the last 6 months with clear white background.',
                    'is_active' => true,
                ],
                'DOC-TIN-CERT' => [
                    'name' => 'Tax Identification Number (TIN) Certificate',
                    'code' => 'DOC-TIN-CERT',
                    'description' => 'Official paper or digital TIN registration certificate issued by the Revenues Bureau.',
                    'is_active' => true,
                ],
                'DOC-TAX-CLEAR' => [
                    'name' => 'Digital Tax Clearance Certificate (Recent Fiscal Year)',
                    'code' => 'DOC-TAX-CLEAR',
                    'description' => 'Official clearance confirming zero outstanding tax liabilities and current fiscal filing.',
                    'is_active' => true,
                ],
                'DOC-LEASE-AGREE' => [
                    'name' => 'Commercial Lease Agreement / Property Title Deed',
                    'code' => 'DOC-LEASE-AGREE',
                    'description' => 'Notarized lease contract or certified landholding title deed proving physical premise rights.',
                    'is_active' => true,
                ],
                'DOC-TRADE-NAME' => [
                    'name' => 'Approved Trade Name Reservation Certificate',
                    'code' => 'DOC-TRADE-NAME',
                    'description' => 'National commercial registry name clearance verifying unique business name reservation.',
                    'is_active' => true,
                ],
                'DOC-ART-ASSOC' => [
                    'name' => 'Articles & Memorandum of Association (for Entities)',
                    'code' => 'DOC-ART-ASSOC',
                    'description' => 'Notarized company bylaws, partnership agreement, or corporate board resolution.',
                    'is_active' => true,
                ],
                'DOC-LAND-HOLD' => [
                    'name' => 'Cadastral Map & Parcel Landholding Certificate',
                    'code' => 'DOC-LAND-HOLD',
                    'description' => 'Original legal landholding booklet or certified cadastral survey certificate.',
                    'is_active' => true,
                ],
                'DOC-ARCH-DRAW' => [
                    'name' => 'Certified Architectural & Structural Engineering Drawings',
                    'code' => 'DOC-ARCH-DRAW',
                    'description' => 'Complete blueprints stamped and signed by licensed practicing architectural and structural engineers.',
                    'is_active' => true,
                ],
                'DOC-ENV-CLEAR' => [
                    'name' => 'Environmental & Safety Impact Clearance (EIA)',
                    'code' => 'DOC-ENV-CLEAR',
                    'description' => 'Safety, fire protection, and environmental compliance endorsement certificate.',
                    'is_active' => true,
                ],
                'DOC-COURT-POA' => [
                    'name' => 'Court Decision / Power of Attorney (if Representative)',
                    'code' => 'DOC-COURT-POA',
                    'description' => 'Legally authenticated Power of Attorney or court inheritance/guardianship decree.',
                    'is_active' => true,
                ],
            ];

            $seededDocuments = [];
            foreach ($documentsData as $code => $data) {
                $seededDocuments[$code] = Document::updateOrCreate(['code' => $code], $data);
            }

            // 5. Structure Master Services & Subservices
            $servicesHierarchy = [
                // ==========================================
                // MASTER SERVICE 1: Civil Status & Vital Records
                // ==========================================
                [
                    'master' => [
                        'code' => 'CIV-REC',
                        'name' => 'Civil Status & Vital Records',
                        'name_amh' => 'የሲቪል ምዝገባ እና የህይወት ክስተቶች',
                        'name_oro' => 'Galmee Haala Hawaasummaa fi Taateewwan Murteessoo',
                        'organization_id' => $seededBureaus['civil-registration-agency']->id,
                        'description' => 'Official vital statistics, birth, marriage, death records, and resident identification card services for Addis Ababa citizens.',
                        'description_amh' => 'የልደት፣ የጋብቻ፣ የሞት ምዝገባ እና የነዋሪነት መታወቂያ ካርድ አገልግሎቶች',
                        'description_oro' => 'Tajaajila galmee dhalootaa, gaa\'elaa, du\'aa fi waraqaa eenyummaa jiraattotaa',
                        'eligibility_criteria' => 'All residents of Addis Ababa and legal guardians.',
                        'estimated_duration_minutes' => 30,
                        'fee_amount' => 0.00,
                        'fee_currency' => 'ETB',
                        'fee_notes' => 'Registration of vital events within statutory deadlines is free.',
                        'is_active' => true,
                    ],
                    'subservices' => [
                        [
                            'code' => 'CIV-BIRTH',
                            'name' => 'Birth Registration & Certificate Issuance',
                            'name_amh' => 'የልደት ምዝገባ እና የምስክር ወረቀት አሰጣጥ',
                            'name_oro' => 'Galmee Dhalootaa fi Kenniinsa Waraqaa Ragaa',
                            'description' => 'Registration of newborn or late birth with legal civil registration and issuance of an official biometric birth certificate.',
                            'description_amh' => 'አዲስ የተወለደ ልጅ ህጋዊ ምዝገባ እና የባዮሜትሪክ የልደት ምስክር ወረቀት መስጠት',
                            'description_oro' => 'Galmee dhalootaa daa\'ima haaraa fi waraqaa ragaa baayomeetiriikii kennuu',
                            'eligibility_criteria' => 'Parents, legal guardians, or authorized representatives with formal court authorization.',
                            'estimated_duration_minutes' => 30,
                            'fee_amount' => 0.00,
                            'fee_currency' => 'ETB',
                            'fee_notes' => 'Free within 90 days of birth; late registration fee applies thereafter.',
                            'is_active' => true,
                            'documents' => [
                                ['code' => 'DOC-BIRTH-NOTIF', 'mandatory' => true, 'order' => 1, 'notes' => 'Original signed hospital or health center notification'],
                                ['code' => 'DOC-RES-ID', 'mandatory' => true, 'order' => 2, 'notes' => 'Valid Kebele or Fayda ID of parents'],
                                ['code' => 'DOC-MARR-CERT', 'mandatory' => false, 'order' => 3, 'notes' => 'Parental marriage certificate if registered'],
                                ['code' => 'DOC-PASSPORT-PHOTO', 'mandatory' => true, 'order' => 4, 'notes' => 'Two recent 3x4 photos of the newborn or child'],
                            ],
                            'steps' => [
                                [
                                    'step_number' => 1,
                                    'title' => 'Document Intake & Eligibility Verification',
                                    'instruction' => 'Submit the health facility birth notice and parents’ identification cards to the verification desk for eligibility review.',
                                    'room_number' => 'Room 101',
                                    'floor' => 'Ground Floor',
                                    'building' => 'Main Civic Center',
                                    'department_name' => 'Intake & Triage',
                                    'responsible_title' => 'Intake Clerk',
                                    'estimated_duration_minutes' => 10,
                                ],
                                [
                                    'step_number' => 2,
                                    'title' => 'Vital Events System Entry & Biometrics',
                                    'instruction' => 'Review the computerized draft record on screen, verify spellings in English and Amharic, and confirm parent signatures.',
                                    'room_number' => 'Room 103',
                                    'floor' => 'Ground Floor',
                                    'building' => 'Main Civic Center',
                                    'department_name' => 'Civil Registry Office',
                                    'responsible_title' => 'Civil Registrar Officer',
                                    'estimated_duration_minutes' => 12,
                                ],
                                [
                                    'step_number' => 3,
                                    'title' => 'Official Certificate Printing & Embossed Seal',
                                    'instruction' => 'Receive the laminated official birth certificate embossed with the Addis Ababa City Administration dry seal.',
                                    'room_number' => 'Room 105',
                                    'floor' => 'Ground Floor',
                                    'building' => 'Main Civic Center',
                                    'department_name' => 'Issuance & Records',
                                    'responsible_title' => 'Records Supervisor',
                                    'estimated_duration_minutes' => 8,
                                ],
                            ],
                        ],
                        [
                            'code' => 'CIV-MARR',
                            'name' => 'Marriage Registration & Certificate',
                            'description' => 'Solemnization and formal registration of legal marriage with issuance of recognized municipal marriage certificates.',
                            'eligibility_criteria' => 'Spouses aged 18 or older, accompanied by two adult witnesses possessing valid IDs.',
                            'estimated_duration_minutes' => 45,
                            'fee_amount' => 100.00,
                            'fee_currency' => 'ETB',
                            'fee_notes' => '100 ETB administrative fee paid via Telebirr or CBE Birr.',
                            'is_active' => true,
                            'documents' => [
                                ['code' => 'DOC-RES-ID', 'mandatory' => true, 'order' => 1, 'notes' => 'Valid IDs of both spouses and both witnesses'],
                                ['code' => 'DOC-PASSPORT-PHOTO', 'mandatory' => true, 'order' => 2, 'notes' => 'Four recent color photographs of each spouse'],
                            ],
                            'steps' => [
                                [
                                    'step_number' => 1,
                                    'title' => 'Pre-marital Intake & Witness Verification',
                                    'instruction' => 'Spouses and their two witnesses present IDs, sign the appearance register, and confirm marital status affidavits.',
                                    'room_number' => 'Room 102',
                                    'floor' => 'Ground Floor',
                                    'building' => 'Main Civic Center',
                                    'department_name' => 'Marriage Services',
                                    'responsible_title' => 'Marriage Clerk',
                                    'estimated_duration_minutes' => 15,
                                ],
                                [
                                    'step_number' => 2,
                                    'title' => 'Marriage Ledger Signing & Solemnization',
                                    'instruction' => 'Spouses and witnesses sign the national marriage registry books in the presence of the civil registrar.',
                                    'room_number' => 'Room 104',
                                    'floor' => 'Ground Floor',
                                    'building' => 'Main Civic Center',
                                    'department_name' => 'Civil Solemnization Hall',
                                    'responsible_title' => 'Registrar Magistrate',
                                    'estimated_duration_minutes' => 20,
                                ],
                                [
                                    'step_number' => 3,
                                    'title' => 'Marriage Certificate Issuance',
                                    'instruction' => 'Collect two official serialized copies of the registered marriage certificate.',
                                    'room_number' => 'Room 105',
                                    'floor' => 'Ground Floor',
                                    'building' => 'Main Civic Center',
                                    'department_name' => 'Issuance & Records',
                                    'responsible_title' => 'Records Supervisor',
                                    'estimated_duration_minutes' => 10,
                                ],
                            ],
                        ],
                        [
                            'code' => 'CIV-DEATH',
                            'name' => 'Death Registration & Burial Permit',
                            'description' => 'Formal recording of deceased residents, issuance of official death certificates, and municipal burial clearance permits.',
                            'eligibility_criteria' => 'Immediate family member, spouse, or authorized hospital representative.',
                            'estimated_duration_minutes' => 20,
                            'fee_amount' => 0.00,
                            'fee_currency' => 'ETB',
                            'fee_notes' => 'Completely free of charge as an essential public vital service.',
                            'is_active' => true,
                            'documents' => [
                                ['code' => 'DOC-DEATH-NOTIF', 'mandatory' => true, 'order' => 1, 'notes' => 'Physician death certificate from hospital or health center'],
                                ['code' => 'DOC-RES-ID', 'mandatory' => true, 'order' => 2, 'notes' => 'Applicant ID and deceased resident ID card'],
                            ],
                            'steps' => [
                                [
                                    'step_number' => 1,
                                    'title' => 'Medical Death Certificate Verification',
                                    'instruction' => 'Submit physician death confirmation and identity credentials for immediate record validation.',
                                    'room_number' => 'Room 101',
                                    'floor' => 'Ground Floor',
                                    'building' => 'Main Civic Center',
                                    'department_name' => 'Emergency Vital Desk',
                                    'responsible_title' => 'Urgent Records Officer',
                                    'estimated_duration_minutes' => 10,
                                ],
                                [
                                    'step_number' => 2,
                                    'title' => 'Burial Permit & Death Certificate Delivery',
                                    'instruction' => 'Receive authorized burial permit for cemetery dispatch along with the official digital death certificate.',
                                    'room_number' => 'Room 106',
                                    'floor' => 'Ground Floor',
                                    'building' => 'Main Civic Center',
                                    'department_name' => 'Vital Registry Archives',
                                    'responsible_title' => 'Registry Officer',
                                    'estimated_duration_minutes' => 10,
                                ],
                            ],
                        ],
                        [
                            'code' => 'CIV-RESID',
                            'name' => 'Resident ID Card Issuance & Renewal',
                            'description' => 'Issuance of new, renewed, or replacement municipal resident identification cards with biometric authentication.',
                            'eligibility_criteria' => 'Residents residing in the Woreda/Sub-city for at least 6 months with proof of residence.',
                            'estimated_duration_minutes' => 30,
                            'fee_amount' => 50.00,
                            'fee_currency' => 'ETB',
                            'fee_notes' => '50 ETB for new issuance or renewal; 100 ETB for replacement of lost ID.',
                            'is_active' => true,
                            'documents' => [
                                ['code' => 'DOC-RES-ID', 'mandatory' => true, 'order' => 1, 'notes' => 'Previous Kebele ID or proof of residence letter'],
                                ['code' => 'DOC-LEASE-AGREE', 'mandatory' => true, 'order' => 2, 'notes' => 'Rental contract or house ownership title deed'],
                                ['code' => 'DOC-PASSPORT-PHOTO', 'mandatory' => true, 'order' => 3, 'notes' => 'Two color photographs with clear background'],
                            ],
                            'steps' => [
                                [
                                    'step_number' => 1,
                                    'title' => 'Residential Address & Kebele Verification',
                                    'instruction' => 'Verify house number and residential tenure against the local kebele housing database.',
                                    'room_number' => 'Room 201',
                                    'floor' => '1st Floor',
                                    'building' => 'Woreda Administrative Block',
                                    'department_name' => 'Residency Affairs',
                                    'responsible_title' => 'Residency Officer',
                                    'estimated_duration_minutes' => 10,
                                ],
                                [
                                    'step_number' => 2,
                                    'title' => 'Biometric Photo & Fingerprint Capture',
                                    'instruction' => 'Digital capture of facial photograph and electronic ten-fingerprint scanning.',
                                    'room_number' => 'Room 202',
                                    'floor' => '1st Floor',
                                    'building' => 'Woreda Administrative Block',
                                    'department_name' => 'Digital ID Station',
                                    'responsible_title' => 'Biometrics Technician',
                                    'estimated_duration_minutes' => 12,
                                ],
                                [
                                    'step_number' => 3,
                                    'title' => 'Resident ID Printing & Card Handover',
                                    'instruction' => 'Receive encrypted QR-enabled resident identification card.',
                                    'room_number' => 'Room 204',
                                    'floor' => '1st Floor',
                                    'building' => 'Woreda Administrative Block',
                                    'department_name' => 'Card Dispatch',
                                    'responsible_title' => 'Dispatch Clerk',
                                    'estimated_duration_minutes' => 8,
                                ],
                            ],
                        ],
                    ],
                ],

                // ==========================================
                // MASTER SERVICE 2: Revenues & Taxation Services
                // ==========================================
                [
                    'master' => [
                        'code' => 'REV-TAX',
                        'name' => 'Revenues & Taxation Services',
                        'organization_id' => $seededBureaus['revenues-bureau']->id,
                        'description' => 'Comprehensive municipal revenue administration, business taxpayer registration, tax clearance, and digital fiscal compliance.',
                        'eligibility_criteria' => 'All business entities, professionals, and individual taxpayers registered in Addis Ababa.',
                        'estimated_duration_minutes' => 45,
                        'fee_amount' => 0.00,
                        'fee_currency' => 'ETB',
                        'fee_notes' => 'Registration and clearance processes are free of administrative fees.',
                        'is_active' => true,
                    ],
                    'subservices' => [
                        [
                            'code' => 'REV-ETIN',
                            'name' => 'e-TIN Registration & Amendment',
                            'description' => 'Issuance of new national Tax Identification Numbers (e-TIN) and updates to existing taxpayer profiles.',
                            'eligibility_criteria' => 'Any individual aged 18+ or registered business entity.',
                            'estimated_duration_minutes' => 20,
                            'fee_amount' => 0.00,
                            'fee_currency' => 'ETB',
                            'fee_notes' => 'Completely free of charge.',
                            'is_active' => true,
                            'documents' => [
                                ['code' => 'DOC-RES-ID', 'mandatory' => true, 'order' => 1, 'notes' => 'Valid Resident ID or Passport'],
                                ['code' => 'DOC-PASSPORT-PHOTO', 'mandatory' => true, 'order' => 2, 'notes' => 'Two passport photos'],
                                ['code' => 'DOC-ART-ASSOC', 'mandatory' => false, 'order' => 3, 'notes' => 'If registering on behalf of a partnership or enterprise'],
                            ],
                            'steps' => [
                                [
                                    'step_number' => 1,
                                    'title' => 'Taxpayer Profile Data Intake',
                                    'instruction' => 'Present identification and complete taxpayer biometric enrollment slip.',
                                    'room_number' => 'Counter 1',
                                    'floor' => 'Ground Floor',
                                    'building' => 'Taxpayer Service Center',
                                    'department_name' => 'TIN Registration',
                                    'responsible_title' => 'Tax Intake Officer',
                                    'estimated_duration_minutes' => 8,
                                ],
                                [
                                    'step_number' => 2,
                                    'title' => 'Biometric Scanning & System Approval',
                                    'instruction' => 'Provide digital fingerprint and capture digital photograph for e-tax linkage.',
                                    'room_number' => 'Counter 2',
                                    'floor' => 'Ground Floor',
                                    'building' => 'Taxpayer Service Center',
                                    'department_name' => 'Biometric Enrollment',
                                    'responsible_title' => 'Systems Officer',
                                    'estimated_duration_minutes' => 7,
                                ],
                                [
                                    'step_number' => 3,
                                    'title' => 'Official e-TIN Certificate Delivery',
                                    'instruction' => 'Collect official serialized e-TIN certificate slip with QR verification.',
                                    'room_number' => 'Counter 3',
                                    'floor' => 'Ground Floor',
                                    'building' => 'Taxpayer Service Center',
                                    'department_name' => 'TIN Dispatch',
                                    'responsible_title' => 'Tax Service Clerk',
                                    'estimated_duration_minutes' => 5,
                                ],
                            ],
                        ],
                        [
                            'code' => 'REV-CLEAR',
                            'name' => 'Digital Tax Clearance Certificate',
                            'description' => 'Verification of zero pending tax liabilities and issuance of an official tax clearance certificate for bidding, license renewal, or property sale.',
                            'eligibility_criteria' => 'Registered businesses and sole proprietors up-to-date with tax declarations.',
                            'estimated_duration_minutes' => 60,
                            'fee_amount' => 0.00,
                            'fee_currency' => 'ETB',
                            'fee_notes' => 'Free; all outstanding tax dues and penalties must be settled.',
                            'is_active' => true,
                            'documents' => [
                                ['code' => 'DOC-TIN-CERT', 'mandatory' => true, 'order' => 1, 'notes' => 'Valid e-TIN certificate'],
                                ['code' => 'DOC-RES-ID', 'mandatory' => true, 'order' => 2, 'notes' => 'Manager or owner valid identification'],
                                ['code' => 'DOC-TAX-CLEAR', 'mandatory' => false, 'order' => 3, 'notes' => 'Prior year clearance copy if available'],
                            ],
                            'steps' => [
                                [
                                    'step_number' => 1,
                                    'title' => 'Tax Declaration & Ledger Audit',
                                    'instruction' => 'Auditor checks VAT, TOT, and withholding tax declarations in SIGTAS / e-Tax system.',
                                    'room_number' => 'Room 302',
                                    'floor' => '2nd Floor',
                                    'building' => 'Revenues Complex',
                                    'department_name' => 'Tax Audit & Compliance',
                                    'responsible_title' => 'Senior Tax Auditor',
                                    'estimated_duration_minutes' => 30,
                                ],
                                [
                                    'step_number' => 2,
                                    'title' => 'Payment Verification & Receipt Clearance',
                                    'instruction' => 'Verify bank clearance for assessed taxes and resolve discrepancies.',
                                    'room_number' => 'Cashier Desk 1',
                                    'floor' => '2nd Floor',
                                    'building' => 'Revenues Complex',
                                    'department_name' => 'Revenue Reconciliation',
                                    'responsible_title' => 'Finance Officer',
                                    'estimated_duration_minutes' => 15,
                                ],
                                [
                                    'step_number' => 3,
                                    'title' => 'Tax Clearance Certificate Authorization',
                                    'instruction' => 'Branch manager approves digital clearance with security watermark.',
                                    'room_number' => 'Room 305',
                                    'floor' => '2nd Floor',
                                    'building' => 'Revenues Complex',
                                    'department_name' => 'Tax Branch Directorate',
                                    'responsible_title' => 'Branch Director',
                                    'estimated_duration_minutes' => 15,
                                ],
                            ],
                        ],
                        [
                            'code' => 'REV-ASSESS',
                            'name' => 'Business Income & Turnover Tax Assessment',
                            'description' => 'Annual or periodic category A/B/C business income tax assessment and formal tax notice issuance.',
                            'eligibility_criteria' => 'Category A, B, and C business owners operating within the sub-city.',
                            'estimated_duration_minutes' => 90,
                            'fee_amount' => 0.00,
                            'fee_currency' => 'ETB',
                            'fee_notes' => 'Assessment is free; payable tax depends on assessed turnover.',
                            'is_active' => true,
                            'documents' => [
                                ['code' => 'DOC-TIN-CERT', 'mandatory' => true, 'order' => 1, 'notes' => 'Active e-TIN certificate'],
                                ['code' => 'DOC-LEASE-AGREE', 'mandatory' => true, 'order' => 2, 'notes' => 'Commercial premises rent proof'],
                            ],
                            'steps' => [
                                [
                                    'step_number' => 1,
                                    'title' => 'Sales Books & Daily Transaction Submission',
                                    'instruction' => 'Submit daily transaction logs, cash register Z-reports, and expense receipts.',
                                    'room_number' => 'Room 310',
                                    'floor' => '2nd Floor',
                                    'building' => 'Revenues Complex',
                                    'department_name' => 'Assessment Intake',
                                    'responsible_title' => 'Assessment Clerk',
                                    'estimated_duration_minutes' => 25,
                                ],
                                [
                                    'step_number' => 2,
                                    'title' => 'Officer Assessment & Computation',
                                    'instruction' => 'Assessment committee computes tax liabilities and explains applied deductions.',
                                    'room_number' => 'Room 312',
                                    'floor' => '2nd Floor',
                                    'building' => 'Revenues Complex',
                                    'department_name' => 'Assessment Directorate',
                                    'responsible_title' => 'Assessment Team Lead',
                                    'estimated_duration_minutes' => 45,
                                ],
                                [
                                    'step_number' => 3,
                                    'title' => 'Tax Assessment Notice Handover',
                                    'instruction' => 'Receive formal assessment notice voucher with 30-day payment schedule.',
                                    'room_number' => 'Counter 4',
                                    'floor' => 'Ground Floor',
                                    'building' => 'Revenues Complex',
                                    'department_name' => 'Customer Support',
                                    'responsible_title' => 'Notice Dispatch Clerk',
                                    'estimated_duration_minutes' => 20,
                                ],
                            ],
                        ],
                    ],
                ],

                // ==========================================
                // MASTER SERVICE 3: Trade & Commercial Licensing
                // ==========================================
                [
                    'master' => [
                        'code' => 'TRD-LIC',
                        'name' => 'Trade & Commercial Licensing',
                        'organization_id' => $seededBureaus['trade-industry-bureau']->id,
                        'description' => 'Business registration, new trade license issuance, annual renewal, and commercial sector modifications.',
                        'eligibility_criteria' => 'Sole proprietors, partnerships, and legal commercial entities.',
                        'estimated_duration_minutes' => 60,
                        'fee_amount' => 0.00,
                        'fee_currency' => 'ETB',
                        'fee_notes' => 'Licensing fees depend on the specific commercial sector and operation scale.',
                        'is_active' => true,
                    ],
                    'subservices' => [
                        [
                            'code' => 'TRD-NEW',
                            'name' => 'New Commercial Business License',
                            'description' => 'Registration of a new sole proprietorship or commercial entity and initial issuance of an official trade license.',
                            'eligibility_criteria' => 'Ethiopian citizens or foreign investors with valid investment permit and approved business address.',
                            'estimated_duration_minutes' => 90,
                            'fee_amount' => 250.00,
                            'fee_currency' => 'ETB',
                            'fee_notes' => '250 ETB government fee per commercial sector registered.',
                            'is_active' => true,
                            'documents' => [
                                ['code' => 'DOC-TRADE-NAME', 'mandatory' => true, 'order' => 1, 'notes' => 'Approved Trade Name reservation letter'],
                                ['code' => 'DOC-TIN-CERT', 'mandatory' => true, 'order' => 2, 'notes' => 'New or active e-TIN certificate'],
                                ['code' => 'DOC-LEASE-AGREE', 'mandatory' => true, 'order' => 3, 'notes' => 'Notarized commercial lease agreement or title deed'],
                                ['code' => 'DOC-RES-ID', 'mandatory' => true, 'order' => 4, 'notes' => 'Valid identification of applicant'],
                                ['code' => 'DOC-PASSPORT-PHOTO', 'mandatory' => true, 'order' => 5, 'notes' => 'Two recent 3x4 photos'],
                            ],
                            'steps' => [
                                [
                                    'step_number' => 1,
                                    'title' => 'Trade Name & Competency Verification',
                                    'instruction' => 'Verify approved trade name reservation in the national business registry database.',
                                    'room_number' => 'Desk A1',
                                    'floor' => '1st Floor',
                                    'building' => 'One-Stop Business Center',
                                    'department_name' => 'Commercial Registry',
                                    'responsible_title' => 'Trade Registrar',
                                    'estimated_duration_minutes' => 25,
                                ],
                                [
                                    'step_number' => 2,
                                    'title' => 'Business Premise & Zoning Approval',
                                    'instruction' => 'Inspect premise location map and confirm compliance with municipal commercial zoning rules.',
                                    'room_number' => 'Desk A3',
                                    'floor' => '1st Floor',
                                    'building' => 'One-Stop Business Center',
                                    'department_name' => 'Inspection & Standards',
                                    'responsible_title' => 'Standards Inspector',
                                    'estimated_duration_minutes' => 35,
                                ],
                                [
                                    'step_number' => 3,
                                    'title' => 'Payment & License Printing',
                                    'instruction' => 'Pay commercial license fee and collect the laminated official trade license certificate.',
                                    'room_number' => 'Desk B2',
                                    'floor' => '1st Floor',
                                    'building' => 'One-Stop Business Center',
                                    'department_name' => 'License Issuance',
                                    'responsible_title' => 'Licensing Officer',
                                    'estimated_duration_minutes' => 30,
                                ],
                            ],
                        ],
                        [
                            'code' => 'TRD-RENEW',
                            'name' => 'Business License Renewal',
                            'description' => 'Annual statutory renewal of valid trade licenses upon proof of annual tax settlement.',
                            'eligibility_criteria' => 'Holders of active commercial licenses.',
                            'estimated_duration_minutes' => 30,
                            'fee_amount' => 150.00,
                            'fee_currency' => 'ETB',
                            'fee_notes' => '150 ETB renewal fee; late renewal penalty applies after statutory deadline.',
                            'is_active' => true,
                            'documents' => [
                                ['code' => 'DOC-TAX-CLEAR', 'mandatory' => true, 'order' => 1, 'notes' => 'Valid annual tax clearance certificate'],
                                ['code' => 'DOC-RES-ID', 'mandatory' => true, 'order' => 2, 'notes' => 'Valid owner or representative ID'],
                                ['code' => 'DOC-TIN-CERT', 'mandatory' => true, 'order' => 3, 'notes' => 'TIN certificate'],
                            ],
                            'steps' => [
                                [
                                    'step_number' => 1,
                                    'title' => 'Tax Clearance & Penalty Verification',
                                    'instruction' => 'Present previous year license and verified tax clearance slip.',
                                    'room_number' => 'Desk A2',
                                    'floor' => '1st Floor',
                                    'building' => 'One-Stop Business Center',
                                    'department_name' => 'Renewal Verification',
                                    'responsible_title' => 'Renewal Officer',
                                    'estimated_duration_minutes' => 10,
                                ],
                                [
                                    'step_number' => 2,
                                    'title' => 'Payment & Digital License Renewal Endorsement',
                                    'instruction' => 'Pay renewal fee and receive barcode renewal sticker stamped on original license.',
                                    'room_number' => 'Desk B1',
                                    'floor' => '1st Floor',
                                    'building' => 'One-Stop Business Center',
                                    'department_name' => 'Renewal Endorsement',
                                    'responsible_title' => 'Endorsement Clerk',
                                    'estimated_duration_minutes' => 20,
                                ],
                            ],
                        ],
                        [
                            'code' => 'TRD-AMEND',
                            'name' => 'Commercial Registration Amendment',
                            'description' => 'Modification of business trade name, change of commercial address, addition of business sectors, or manager substitution.',
                            'eligibility_criteria' => 'Registered business owners or legal representatives.',
                            'estimated_duration_minutes' => 45,
                            'fee_amount' => 100.00,
                            'fee_currency' => 'ETB',
                            'fee_notes' => '100 ETB per modification category.',
                            'is_active' => true,
                            'documents' => [
                                ['code' => 'DOC-TAX-CLEAR', 'mandatory' => true, 'order' => 1, 'notes' => 'Current tax clearance'],
                                ['code' => 'DOC-LEASE-AGREE', 'mandatory' => false, 'order' => 2, 'notes' => 'Required if updating physical premise address'],
                                ['code' => 'DOC-COURT-POA', 'mandatory' => false, 'order' => 3, 'notes' => 'Required if representative is executing amendment'],
                            ],
                            'steps' => [
                                [
                                    'step_number' => 1,
                                    'title' => 'Amendment Application Intake',
                                    'instruction' => 'Submit signed amendment request form along with supporting board resolution or documents.',
                                    'room_number' => 'Desk A4',
                                    'floor' => '1st Floor',
                                    'building' => 'One-Stop Business Center',
                                    'department_name' => 'Commercial Registry',
                                    'responsible_title' => 'Amendments Officer',
                                    'estimated_duration_minutes' => 20,
                                ],
                                [
                                    'step_number' => 2,
                                    'title' => 'Registry Update & Certificate Issuance',
                                    'instruction' => 'System registry is updated and replacement certificate is issued.',
                                    'room_number' => 'Desk B2',
                                    'floor' => '1st Floor',
                                    'building' => 'One-Stop Business Center',
                                    'department_name' => 'License Issuance',
                                    'responsible_title' => 'Licensing Officer',
                                    'estimated_duration_minutes' => 25,
                                ],
                            ],
                        ],
                    ],
                ],

                // ==========================================
                // MASTER SERVICE 4: Land Development & Property Administration
                // ==========================================
                [
                    'master' => [
                        'code' => 'LND-ADM',
                        'name' => 'Land Development & Property Administration',
                        'organization_id' => $seededBureaus['land-development-bureau']->id,
                        'description' => 'Municipal land tenure, cadastre parcel demarcation, lease management, and property title deed verification.',
                        'eligibility_criteria' => 'Property owners, land leaseholders, and inheritors in Addis Ababa.',
                        'estimated_duration_minutes' => 120,
                        'fee_amount' => 0.00,
                        'fee_currency' => 'ETB',
                        'fee_notes' => 'Specific survey and registration fees apply per transaction type.',
                        'is_active' => true,
                    ],
                    'subservices' => [
                        [
                            'code' => 'LND-VERIF',
                            'name' => 'Landholding Record Verification & Cadastre Mapping',
                            'description' => 'Official cadastral survey, plot boundary verification, and issuance of certified landholding map extract.',
                            'eligibility_criteria' => 'Registered landholders or court-appointed legal executors.',
                            'estimated_duration_minutes' => 120,
                            'fee_amount' => 120.00,
                            'fee_currency' => 'ETB',
                            'fee_notes' => '120 ETB administrative survey and mapping fee.',
                            'is_active' => true,
                            'documents' => [
                                ['code' => 'DOC-LAND-HOLD', 'mandatory' => true, 'order' => 1, 'notes' => 'Original landholding certificate / yellow booklet'],
                                ['code' => 'DOC-RES-ID', 'mandatory' => true, 'order' => 2, 'notes' => 'Valid applicant ID'],
                                ['code' => 'DOC-LEASE-AGREE', 'mandatory' => false, 'order' => 3, 'notes' => 'Lease contract copy if leased land'],
                            ],
                            'steps' => [
                                [
                                    'step_number' => 1,
                                    'title' => 'Cadastral File Intake & Search',
                                    'instruction' => 'Submit plot number and block code to retrieve physical and GIS parcel archives.',
                                    'room_number' => 'Desk C1',
                                    'floor' => 'Ground Floor',
                                    'building' => 'Land Administration Tower',
                                    'department_name' => 'Archive & Inquiries',
                                    'responsible_title' => 'Cadastre Clerk',
                                    'estimated_duration_minutes' => 30,
                                ],
                                [
                                    'step_number' => 2,
                                    'title' => 'GIS Spatial Verification & Boundary Audit',
                                    'instruction' => 'GIS engineer compares satellite plot boundary against master city cadastre overlay.',
                                    'room_number' => 'Room 402',
                                    'floor' => '3rd Floor',
                                    'building' => 'Land Administration Tower',
                                    'department_name' => 'Geospatial Cadastre Unit',
                                    'responsible_title' => 'GIS Surveyor',
                                    'estimated_duration_minutes' => 60,
                                ],
                                [
                                    'step_number' => 3,
                                    'title' => 'Certified Cadastre Certificate Handover',
                                    'instruction' => 'Collect certified official cadastre map with coordinates and seal.',
                                    'room_number' => 'Desk C3',
                                    'floor' => 'Ground Floor',
                                    'building' => 'Land Administration Tower',
                                    'department_name' => 'Document Dispatch',
                                    'responsible_title' => 'Land Officer',
                                    'estimated_duration_minutes' => 30,
                                ],
                            ],
                        ],
                        [
                            'code' => 'LND-TRANS',
                            'name' => 'Land Rights Creation & Title Deed Transfer',
                            'description' => 'Legal transfer of real estate ownership, landholding rights through purchase, donation, or inheritance.',
                            'eligibility_criteria' => 'Buyer, seller, or authenticated legal representatives.',
                            'estimated_duration_minutes' => 240,
                            'fee_amount' => 500.00,
                            'fee_currency' => 'ETB',
                            'fee_notes' => '500 ETB processing fee plus statutory property transfer stamp duty.',
                            'is_active' => true,
                            'documents' => [
                                ['code' => 'DOC-LAND-HOLD', 'mandatory' => true, 'order' => 1, 'notes' => 'Original Title Deed / Certificate'],
                                ['code' => 'DOC-COURT-POA', 'mandatory' => true, 'order' => 2, 'notes' => 'Notarized contract of sale or court inheritance judgment'],
                                ['code' => 'DOC-TAX-CLEAR', 'mandatory' => true, 'order' => 3, 'notes' => 'Property tax clearance for the parcel'],
                                ['code' => 'DOC-RES-ID', 'mandatory' => true, 'order' => 4, 'notes' => 'IDs of both transferor and transferee'],
                            ],
                            'steps' => [
                                [
                                    'step_number' => 1,
                                    'title' => 'Contract & Encumbrance Verification',
                                    'instruction' => 'Verify that parcel has no active court injunctions, bank mortgages, or tax liens.',
                                    'room_number' => 'Room 410',
                                    'floor' => '3rd Floor',
                                    'building' => 'Land Administration Tower',
                                    'department_name' => 'Legal Audit & Liens',
                                    'responsible_title' => 'Legal Examiner',
                                    'estimated_duration_minutes' => 60,
                                ],
                                [
                                    'step_number' => 2,
                                    'title' => 'Property Valuation & Stamp Duty Assessment',
                                    'instruction' => 'Valuation committee calculates transfer duty based on current zonal real estate indices.',
                                    'room_number' => 'Room 412',
                                    'floor' => '3rd Floor',
                                    'building' => 'Land Administration Tower',
                                    'department_name' => 'Property Valuation',
                                    'responsible_title' => 'Chief Valuer',
                                    'estimated_duration_minutes' => 90,
                                ],
                                [
                                    'step_number' => 3,
                                    'title' => 'Title Deed Transfer Endorsement & Signatures',
                                    'instruction' => 'Parties sign title register, old certificate is cancelled, and new owner deed is printed.',
                                    'room_number' => 'Room 415',
                                    'floor' => '3rd Floor',
                                    'building' => 'Land Administration Tower',
                                    'department_name' => 'Title Registration',
                                    'responsible_title' => 'Registrar of Deeds',
                                    'estimated_duration_minutes' => 90,
                                ],
                            ],
                        ],
                        [
                            'code' => 'LND-LEASE',
                            'name' => 'City Land Lease Tender Participation & Information',
                            'description' => 'Public tender participation for residential, commercial, and industrial municipal land lease plots.',
                            'eligibility_criteria' => 'All interested domestic and international investors and residents.',
                            'estimated_duration_minutes' => 15,
                            'fee_amount' => 0.00,
                            'fee_currency' => 'ETB',
                            'fee_notes' => 'Information is free; tender bidding document purchase has separate published fee.',
                            'is_active' => true,
                            'documents' => [
                                ['code' => 'DOC-RES-ID', 'mandatory' => true, 'order' => 1, 'notes' => 'Valid identification'],
                                ['code' => 'DOC-TIN-CERT', 'mandatory' => true, 'order' => 2, 'notes' => 'TIN registration certificate'],
                            ],
                            'steps' => [
                                [
                                    'step_number' => 1,
                                    'title' => 'Tender Notice & Plot List Consultation',
                                    'instruction' => 'Review currently available lease plots, zoning regulations, and base lease prices.',
                                    'room_number' => 'Info Desk 1',
                                    'floor' => 'Ground Floor',
                                    'building' => 'Land Administration Tower',
                                    'department_name' => 'Lease Tender Office',
                                    'responsible_title' => 'Public Information Officer',
                                    'estimated_duration_minutes' => 10,
                                ],
                                [
                                    'step_number' => 2,
                                    'title' => 'Tender Document Collection & Submission Registration',
                                    'instruction' => 'Purchase official tender booklet and register bid submission code.',
                                    'room_number' => 'Room 420',
                                    'floor' => '3rd Floor',
                                    'building' => 'Land Administration Tower',
                                    'department_name' => 'Tender Committee',
                                    'responsible_title' => 'Tender Secretary',
                                    'estimated_duration_minutes' => 5,
                                ],
                            ],
                        ],
                    ],
                ],

                // ==========================================
                // MASTER SERVICE 5: Urban Planning & Construction Permits
                // ==========================================
                [
                    'master' => [
                        'code' => 'PLN-DEV',
                        'name' => 'Urban Planning & Construction Permits',
                        'organization_id' => $seededBureaus['urban-planning-bureau']->id,
                        'description' => 'Building construction permits, structural architectural review, plan amendments, and municipal zoning compliance.',
                        'eligibility_criteria' => 'Property owners, licensed developers, and registered consulting engineers.',
                        'estimated_duration_minutes' => 180,
                        'fee_amount' => 0.00,
                        'fee_currency' => 'ETB',
                        'fee_notes' => 'Permit tariff depends on building gross square meters and category.',
                        'is_active' => true,
                    ],
                    'subservices' => [
                        [
                            'code' => 'PLN-BUILD',
                            'name' => 'Building Construction Permit & Plan Approval',
                            'description' => 'Evaluation of architectural, structural, sanitary, and electrical drawings for new building construction and permit issuance.',
                            'eligibility_criteria' => 'Owners of registered urban land plots with valid landholding certificates.',
                            'estimated_duration_minutes' => 180,
                            'fee_amount' => 350.00,
                            'fee_currency' => 'ETB',
                            'fee_notes' => '350 ETB base review fee plus permit tariff per square meter of gross built area.',
                            'is_active' => true,
                            'documents' => [
                                ['code' => 'DOC-LAND-HOLD', 'mandatory' => true, 'order' => 1, 'notes' => 'Valid landholding certificate'],
                                ['code' => 'DOC-ARCH-DRAW', 'mandatory' => true, 'order' => 2, 'notes' => 'Full set of engineering drawings stamped by licensed consultants'],
                                ['code' => 'DOC-ENV-CLEAR', 'mandatory' => false, 'order' => 3, 'notes' => 'Required for commercial or mixed-use structures'],
                                ['code' => 'DOC-RES-ID', 'mandatory' => true, 'order' => 4, 'notes' => 'Owner or representative identification'],
                            ],
                            'steps' => [
                                [
                                    'step_number' => 1,
                                    'title' => 'Digital Drawing Submission & Completeness Check',
                                    'instruction' => 'Submit digital and hard copy architectural, electrical, sanitary, and structural plans.',
                                    'room_number' => 'Counter P1',
                                    'floor' => 'Ground Floor',
                                    'building' => 'Urban Development Center',
                                    'department_name' => 'Permit Intake',
                                    'responsible_title' => 'Intake Architect',
                                    'estimated_duration_minutes' => 30,
                                ],
                                [
                                    'step_number' => 2,
                                    'title' => 'Engineering Code & Structural Safety Review',
                                    'instruction' => 'Multi-disciplinary committee inspects building height, setbacks, and structural safety.',
                                    'room_number' => 'Room 503',
                                    'floor' => '4th Floor',
                                    'building' => 'Urban Development Center',
                                    'department_name' => 'Building Safety Committee',
                                    'responsible_title' => 'Structural Review Engineer',
                                    'estimated_duration_minutes' => 100,
                                ],
                                [
                                    'step_number' => 3,
                                    'title' => 'Construction Permit Certificate Handover',
                                    'instruction' => 'Collect approved stamped blueprint drawings and official construction permit booklet.',
                                    'room_number' => 'Room 508',
                                    'floor' => '4th Floor',
                                    'building' => 'Urban Development Center',
                                    'department_name' => 'Permit Issuance',
                                    'responsible_title' => 'Head of Building Permits',
                                    'estimated_duration_minutes' => 50,
                                ],
                            ],
                        ],
                        [
                            'code' => 'PLN-STRUCT',
                            'name' => 'Structural Plan Amendment & Modification',
                            'description' => 'Formal review and approval for alterations, renovations, or structural additions to previously permitted buildings.',
                            'eligibility_criteria' => 'Owners with active construction permits or existing building certificates.',
                            'estimated_duration_minutes' => 120,
                            'fee_amount' => 200.00,
                            'fee_currency' => 'ETB',
                            'fee_notes' => '200 ETB amendment review fee.',
                            'is_active' => true,
                            'documents' => [
                                ['code' => 'DOC-ARCH-DRAW', 'mandatory' => true, 'order' => 1, 'notes' => 'Amended drawings highlighting proposed structural changes in red'],
                                ['code' => 'DOC-LAND-HOLD', 'mandatory' => true, 'order' => 2, 'notes' => 'Landholding certificate'],
                                ['code' => 'DOC-RES-ID', 'mandatory' => true, 'order' => 3, 'notes' => 'Owner identification'],
                            ],
                            'steps' => [
                                [
                                    'step_number' => 1,
                                    'title' => 'Amendment Application Intake',
                                    'instruction' => 'Submit modification request detailing proposed structural or spatial changes.',
                                    'room_number' => 'Counter P1',
                                    'floor' => 'Ground Floor',
                                    'building' => 'Urban Development Center',
                                    'department_name' => 'Permit Intake',
                                    'responsible_title' => 'Intake Architect',
                                    'estimated_duration_minutes' => 25,
                                ],
                                [
                                    'step_number' => 2,
                                    'title' => 'On-site Physical Inspection Scheduling',
                                    'instruction' => 'Verify structural feasibility through municipal engineer site visit inspection.',
                                    'room_number' => 'Room 505',
                                    'floor' => '4th Floor',
                                    'building' => 'Urban Development Center',
                                    'department_name' => 'Field Inspection Unit',
                                    'responsible_title' => 'Site Inspector',
                                    'estimated_duration_minutes' => 65,
                                ],
                                [
                                    'step_number' => 3,
                                    'title' => 'Amended Plan Endorsement',
                                    'instruction' => 'Receive endorsed modification approval stamp on amended construction blueprints.',
                                    'room_number' => 'Room 508',
                                    'floor' => '4th Floor',
                                    'building' => 'Urban Development Center',
                                    'department_name' => 'Permit Issuance',
                                    'responsible_title' => 'Head of Building Permits',
                                    'estimated_duration_minutes' => 30,
                                ],
                            ],
                        ],
                    ],
                ],
            ];

            // 6. Seed Master Services, Subservices, Steps, Documents & Offering Organizations
            $allSubCityIds = collect($seededSubCities)->pluck('id')->all();

            foreach ($servicesHierarchy as $group) {
                $masterData = $group['master'];
                $masterService = Service::updateOrCreate(
                    ['code' => $masterData['code']],
                    [
                        'organization_id' => $masterData['organization_id'],
                        'parent_id' => null,
                        'name' => $masterData['name'],
                        'name_amh' => $masterData['name_amh'] ?? '',
                        'name_oro' => $masterData['name_oro'] ?? '',
                        'description' => $masterData['description'],
                        'description_amh' => $masterData['description_amh'] ?? null,
                        'description_oro' => $masterData['description_oro'] ?? null,
                        'eligibility_criteria' => $masterData['eligibility_criteria'],
                        'estimated_duration_minutes' => $masterData['estimated_duration_minutes'],
                        'fee_amount' => $masterData['fee_amount'],
                        'fee_currency' => $masterData['fee_currency'],
                        'fee_notes' => $masterData['fee_notes'],
                        'is_active' => $masterData['is_active'],
                    ]
                );

                // Offering organizations for master service: Bureau + all active sub-cities
                $offeringOrgIds = array_unique(array_merge([$masterData['organization_id']], $allSubCityIds));
                $syncOffering = [];
                foreach ($offeringOrgIds as $oId) {
                    $syncOffering[$oId] = ['is_available' => true];
                }
                $masterService->offeringOrganizations()->sync($syncOffering);

                // Process subservices
                foreach ($group['subservices'] as $subData) {
                    $subservice = Service::updateOrCreate(
                        ['code' => $subData['code']],
                        [
                            'organization_id' => $masterData['organization_id'],
                            'parent_id' => $masterService->id,
                            'name' => $subData['name'],
                            'name_amh' => $subData['name_amh'] ?? '',
                            'name_oro' => $subData['name_oro'] ?? '',
                            'description' => $subData['description'],
                            'description_amh' => $subData['description_amh'] ?? null,
                            'description_oro' => $subData['description_oro'] ?? null,
                            'eligibility_criteria' => $subData['eligibility_criteria'],
                            'estimated_duration_minutes' => $subData['estimated_duration_minutes'],
                            'fee_amount' => $subData['fee_amount'],
                            'fee_currency' => $subData['fee_currency'],
                            'fee_notes' => $subData['fee_notes'],
                            'is_active' => $subData['is_active'],
                        ]
                    );

                    // Sync offering organizations for subservice
                    $subservice->offeringOrganizations()->sync($syncOffering);

                    // Sync required documents
                    if (! empty($subData['documents'])) {
                        $syncDocs = [];
                        foreach ($subData['documents'] as $docItem) {
                            if (isset($seededDocuments[$docItem['code']])) {
                                $docModel = $seededDocuments[$docItem['code']];
                                $syncDocs[$docModel->id] = [
                                    'is_mandatory' => $docItem['mandatory'],
                                    'order_column' => $docItem['order'],
                                    'notes' => $docItem['notes'],
                                ];
                            }
                        }
                        $subservice->requiredDocuments()->sync($syncDocs);
                    }

                    // Seed room-by-room navigation steps
                    if (! empty($subData['steps'])) {
                        // Remove existing steps for idempotency
                        ServiceStep::where('service_id', $subservice->id)->delete();

                        foreach ($subData['steps'] as $stepItem) {
                            ServiceStep::create([
                                'service_id' => $subservice->id,
                                'organization_id' => $masterData['organization_id'],
                                'step_number' => $stepItem['step_number'],
                                'title' => $stepItem['title'],
                                'title_amh' => $stepItem['title_amh'] ?? '',
                                'title_oro' => $stepItem['title_oro'] ?? '',
                                'instruction' => $stepItem['instruction'],
                                'instruction_amh' => $stepItem['instruction_amh'] ?? null,
                                'instruction_oro' => $stepItem['instruction_oro'] ?? null,
                                'room_number' => $stepItem['room_number'],
                                'floor' => $stepItem['floor'],
                                'building' => $stepItem['building'],
                                'building_amh' => $stepItem['building_amh'] ?? null,
                                'building_oro' => $stepItem['building_oro'] ?? null,
                                'department_name' => $stepItem['department_name'],
                                'department_name_amh' => $stepItem['department_name_amh'] ?? null,
                                'department_name_oro' => $stepItem['department_name_oro'] ?? null,
                                'responsible_title' => $stepItem['responsible_title'],
                                'responsible_title_amh' => $stepItem['responsible_title_amh'] ?? null,
                                'responsible_title_oro' => $stepItem['responsible_title_oro'] ?? null,
                                'estimated_duration_minutes' => $stepItem['estimated_duration_minutes'],
                                'is_active' => true,
                            ]);
                        }
                    }
                }
            }
        });
    }
}

