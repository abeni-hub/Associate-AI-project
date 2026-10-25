<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domains\Documents\Models\Document;
use App\Domains\Services\Models\Service;
use App\Domains\Services\Models\ServiceStep;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Seed initial services, documents, and room-by-room steps.
     */
    public function run(): void
    {
        // 1. Documents
        $kebeleId = Document::updateOrCreate(
            ['code' => 'kebele-id'],
            [
                'name' => 'Kebele Resident ID Card',
                'description' => 'Valid renewed resident identification card issued by local Kebele.',
                'is_active' => true,
            ]
        );

        $birthNotification = Document::updateOrCreate(
            ['code' => 'birth-notification'],
            [
                'name' => 'Hospital Birth Notification Form',
                'description' => 'Official birth notification issued and stamped by a licensed hospital or health center.',
                'is_active' => true,
            ]
        );

        $passportPhoto = Document::updateOrCreate(
            ['code' => 'passport-photo'],
            [
                'name' => 'Passport-Sized Color Photographs',
                'description' => 'Two recent 3x4 cm color photographs with white background.',
                'is_active' => true,
            ]
        );

        // 2. Master Services
        $vitalEvents = Service::updateOrCreate(
            ['code' => 'vital-events'],
            [
                'name' => 'Vital Events Registration',
                'description' => 'Registration and certification of births, marriages, divorces, and deaths.',
                'eligibility_criteria' => 'Citizens residing within the administrative sub-city / woreda.',
                'fee_amount' => 0.00,
                'fee_currency' => 'ETB',
                'is_active' => true,
            ]
        );

        $businessTrade = Service::updateOrCreate(
            ['code' => 'business-trade'],
            [
                'name' => 'Trade and Commercial Licensing',
                'description' => 'Commercial registration, business trade license issuance, and renewals.',
                'eligibility_criteria' => 'Eligible business proprietors and legal entities.',
                'fee_amount' => 0.00,
                'fee_currency' => 'ETB',
                'is_active' => true,
            ]
        );

        // 3. Subservices
        $birthCert = Service::updateOrCreate(
            ['code' => 'birth-certificate'],
            [
                'parent_id' => $vitalEvents->id,
                'name' => 'Birth Certificate Issuance',
                'description' => 'Official registration of newborn or late birth records and certificate issuance.',
                'eligibility_criteria' => 'Parent, guardian, or self (if 18+) with valid hospital notification.',
                'estimated_duration_minutes' => 45,
                'fee_amount' => 50.00,
                'fee_currency' => 'ETB',
                'fee_notes' => '50 ETB government service fee. Free if registered within 30 days of birth.',
                'is_active' => true,
            ]
        );

        // Link Documents
        $birthCert->requiredDocuments()->syncWithoutDetaching([
            $kebeleId->id => ['is_mandatory' => true, 'order_column' => 1, 'notes' => 'Original and photocopy of parent Kebele ID.'],
            $birthNotification->id => ['is_mandatory' => true, 'order_column' => 2, 'notes' => 'Original hospital notification certificate.'],
            $passportPhoto->id => ['is_mandatory' => false, 'order_column' => 3, 'notes' => 'Two recent photographs.'],
        ]);

        // 4. Room-by-Room Service Steps for Birth Certificate
        $steps = [
            [
                'step_number' => 1,
                'title' => 'Intake & Document Verification',
                'instruction' => 'Present original hospital birth notification and both parents Kebele ID cards to the intake officer.',
                'room_number' => 'Room 102',
                'floor' => 'Ground Floor',
                'building' => 'Main Public Service Block',
                'department_name' => 'Civil Registration Desk',
                'responsible_title' => 'Intake Officer',
                'estimated_duration_minutes' => 15,
                'is_active' => true,
            ],
            [
                'step_number' => 2,
                'title' => 'Service Fee Payment',
                'instruction' => 'Pay 50 ETB government service fee and obtain the official digital revenue receipt.',
                'room_number' => 'Counter 3',
                'floor' => 'Ground Floor',
                'building' => 'Main Public Service Block',
                'department_name' => 'Revenue & Cashier Desk',
                'responsible_title' => 'Cashier',
                'estimated_duration_minutes' => 10,
                'is_active' => true,
            ],
            [
                'step_number' => 3,
                'title' => 'Biometric & Registrar Signature',
                'instruction' => 'Present payment receipt. Officer verifies system entry, collects digital signature, and prints official certificate.',
                'room_number' => 'Room 104',
                'floor' => 'Ground Floor',
                'building' => 'Main Public Service Block',
                'department_name' => 'Vital Statistics Bureau',
                'responsible_title' => 'Civil Registrar',
                'estimated_duration_minutes' => 15,
                'is_active' => true,
            ],
            [
                'step_number' => 4,
                'title' => 'Certificate Collection & Dry Seal Stamp',
                'instruction' => 'Collect stamped certificate with official government dry seal and barcode.',
                'room_number' => 'Room 106',
                'floor' => 'Ground Floor',
                'building' => 'Main Public Service Block',
                'department_name' => 'Certificate Dispatch Counter',
                'responsible_title' => 'Dispatch Officer',
                'estimated_duration_minutes' => 5,
                'is_active' => true,
            ],
        ];

        foreach ($steps as $stepData) {
            ServiceStep::updateOrCreate(
                [
                    'service_id' => $birthCert->id,
                    'step_number' => $stepData['step_number'],
                ],
                $stepData
            );
        }
    }
}
