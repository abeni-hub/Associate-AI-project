<?php

declare(strict_types=1);

namespace App\Http\Requests\Api\V1\Cms;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLandingPageCmsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        if (! $user) {
            return false;
        }

        return $user->isSuperAdmin() || $user->hasPermission('cms.manage');
    }

    /**
     * Prepare inputs for validation.
     */
    protected function prepareForValidation(): void
    {
        $hero = $this->input('hero', []);
        if (is_array($hero)) {
            if (empty($hero['titleEn']) && ! empty($hero['title'])) {
                $hero['titleEn'] = $hero['title'];
            }
            if (empty($hero['subtitleEn']) && ! empty($hero['subtitle'])) {
                $hero['subtitleEn'] = $hero['subtitle'];
            }
            $this->merge(['hero' => $hero]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            // 1. Announcement
            'announcement' => ['nullable', 'array'],
            'announcement.enabled' => ['required', 'boolean'],
            'announcement.tag' => ['nullable', 'string', 'max:100'],
            'announcement.message' => ['required_if:announcement.enabled,true', 'nullable', 'string', 'max:255'],
            'announcement.messageAm' => ['nullable', 'string', 'max:255'],
            'announcement.linkText' => ['nullable', 'string', 'max:100'],
            'announcement.linkTextAm' => ['nullable', 'string', 'max:100'],
            'announcement.linkUrl' => ['nullable', 'string', 'max:500'],

            // 2. Hero
            'hero' => ['required', 'array'],
            'hero.badge' => ['nullable', 'string', 'max:100'],
            'hero.badgeAm' => ['nullable', 'string', 'max:100'],
            'hero.titleEn' => ['required', 'string', 'max:200'],
            'hero.titleAm' => ['nullable', 'string', 'max:200'],
            'hero.subtitleEn' => ['nullable', 'string', 'max:500'],
            'hero.subtitleAm' => ['nullable', 'string', 'max:500'],
            'hero.primaryCtaText' => ['nullable', 'string', 'max:100'],
            'hero.primaryCtaTextAm' => ['nullable', 'string', 'max:100'],
            'hero.primaryCtaUrl' => ['nullable', 'string', 'max:500'],
            'hero.secondaryCtaText' => ['nullable', 'string', 'max:100'],
            'hero.secondaryCtaTextAm' => ['nullable', 'string', 'max:100'],
            'hero.secondaryCtaUrl' => ['nullable', 'string', 'max:500'],
            'hero.slides' => ['required', 'array', 'min:1', 'max:10'],
            'hero.slides.*.id' => ['nullable'],
            'hero.slides.*.title' => ['required', 'string', 'max:150'],
            'hero.slides.*.titleAm' => ['nullable', 'string', 'max:150'],
            'hero.slides.*.description' => ['nullable', 'string', 'max:500'],
            'hero.slides.*.descriptionAm' => ['nullable', 'string', 'max:500'],
            'hero.slides.*.bureau' => ['required', 'string', 'max:100'],
            'hero.slides.*.bureauAm' => ['nullable', 'string', 'max:100'],
            'hero.slides.*.category' => ['nullable', 'string', 'max:100'],
            'hero.slides.*.categoryAm' => ['nullable', 'string', 'max:100'],
            'hero.slides.*.image' => ['nullable', 'string', 'max:1000'],
            'hero.slides.*.alt' => ['nullable', 'string', 'max:255'],
            'hero.slides.*.credit' => ['nullable', 'string', 'max:255'],
            'hero.slides.*.source' => ['nullable', 'string', 'max:500'],
            'hero.slides.*.tint' => ['nullable', 'string', 'max:50'],

            // 3. Quick Search
            'quickSearch' => ['nullable', 'array'],
            'quickSearch.enabled' => ['sometimes', 'boolean'],
            'quickSearch.kicker' => ['nullable', 'string', 'max:100'],
            'quickSearch.kickerAm' => ['nullable', 'string', 'max:100'],
            'quickSearch.kickerNum' => ['nullable', 'string', 'max:20'],
            'quickSearch.title' => ['nullable', 'string', 'max:200'],
            'quickSearch.titleAm' => ['nullable', 'string', 'max:200'],
            'quickSearch.subtitle' => ['nullable', 'string', 'max:500'],
            'quickSearch.subtitleAm' => ['nullable', 'string', 'max:500'],
            'quickSearch.buttonText' => ['nullable', 'string', 'max:100'],
            'quickSearch.buttonTextAm' => ['nullable', 'string', 'max:100'],
            'quickSearch.footnoteText' => ['nullable', 'string', 'max:200'],
            'quickSearch.footnoteTextAm' => ['nullable', 'string', 'max:200'],

            // 4. Service Guide
            'serviceGuide' => ['nullable', 'array'],
            'serviceGuide.enabled' => ['sometimes', 'boolean'],
            'serviceGuide.kicker' => ['nullable', 'string', 'max:100'],
            'serviceGuide.kickerAm' => ['nullable', 'string', 'max:100'],
            'serviceGuide.kickerNum' => ['nullable', 'string', 'max:20'],
            'serviceGuide.titleLead' => ['nullable', 'string', 'max:200'],
            'serviceGuide.titleLeadAm' => ['nullable', 'string', 'max:200'],
            'serviceGuide.titleEmphasis' => ['nullable', 'string', 'max:200'],
            'serviceGuide.titleEmphasisAm' => ['nullable', 'string', 'max:200'],
            'serviceGuide.description' => ['nullable', 'string', 'max:1000'],
            'serviceGuide.descriptionAm' => ['nullable', 'string', 'max:1000'],
            'serviceGuide.sampleBadgeText' => ['nullable', 'string', 'max:100'],
            'serviceGuide.sampleBadgeTextAm' => ['nullable', 'string', 'max:100'],
            'serviceGuide.whatToBringTitle' => ['nullable', 'string', 'max:200'],
            'serviceGuide.whatToBringTitleAm' => ['nullable', 'string', 'max:200'],
            'serviceGuide.expectationsNote' => ['nullable', 'string', 'max:500'],
            'serviceGuide.expectationsNoteAm' => ['nullable', 'string', 'max:500'],
            'serviceGuide.routeHeading' => ['nullable', 'string', 'max:200'],
            'serviceGuide.routeHeadingAm' => ['nullable', 'string', 'max:200'],
            'serviceGuide.disclaimerText' => ['nullable', 'string', 'max:500'],
            'serviceGuide.disclaimerTextAm' => ['nullable', 'string', 'max:500'],

            // 5. Journey
            'journey' => ['nullable', 'array'],
            'journey.enabled' => ['sometimes', 'boolean'],
            'journey.kicker' => ['nullable', 'string', 'max:100'],
            'journey.kickerAm' => ['nullable', 'string', 'max:100'],
            'journey.kickerNum' => ['nullable', 'string', 'max:20'],
            'journey.title' => ['nullable', 'string', 'max:200'],
            'journey.titleAm' => ['nullable', 'string', 'max:200'],
            'journey.steps' => ['nullable', 'array'],
            'journey.steps.*.step' => ['nullable', 'string', 'max:50'],
            'journey.steps.*.title' => ['nullable', 'string', 'max:150'],
            'journey.steps.*.titleAm' => ['nullable', 'string', 'max:150'],
            'journey.steps.*.detail' => ['nullable', 'string', 'max:500'],
            'journey.steps.*.detailAm' => ['nullable', 'string', 'max:500'],

            // 6. News & Events
            'newsEvents' => ['nullable', 'array'],
            'newsEvents.enabled' => ['sometimes', 'boolean'],
            'newsEvents.kicker' => ['nullable', 'string', 'max:100'],
            'newsEvents.kickerAm' => ['nullable', 'string', 'max:100'],
            'newsEvents.kickerNum' => ['nullable', 'string', 'max:20'],
            'newsEvents.title' => ['nullable', 'string', 'max:200'],
            'newsEvents.titleAm' => ['nullable', 'string', 'max:200'],
            'newsEvents.sourceLabel' => ['nullable', 'string', 'max:100'],
            'newsEvents.sourceLabelAm' => ['nullable', 'string', 'max:100'],
            'newsEvents.showEvents' => ['nullable', 'boolean'],
            'newsEvents.showNews' => ['nullable', 'boolean'],
            'newsEvents.viewAllText' => ['nullable', 'string', 'max:100'],
            'newsEvents.viewAllTextAm' => ['nullable', 'string', 'max:100'],
            'newsEvents.emptyMessage' => ['nullable', 'string', 'max:255'],
            'newsEvents.emptyMessageAm' => ['nullable', 'string', 'max:255'],

            // 7. Feedback
            'feedback' => ['nullable', 'array'],
            'feedback.enabled' => ['sometimes', 'boolean'],
            'feedback.kicker' => ['nullable', 'string', 'max:100'],
            'feedback.kickerAm' => ['nullable', 'string', 'max:100'],
            'feedback.kickerNum' => ['nullable', 'string', 'max:20'],
            'feedback.title' => ['nullable', 'string', 'max:200'],
            'feedback.titleAm' => ['nullable', 'string', 'max:200'],
            'feedback.description' => ['nullable', 'string', 'max:1000'],
            'feedback.descriptionAm' => ['nullable', 'string', 'max:1000'],
            'feedback.pointOne' => ['nullable', 'string', 'max:255'],
            'feedback.pointOneAm' => ['nullable', 'string', 'max:255'],
            'feedback.pointTwo' => ['nullable', 'string', 'max:255'],
            'feedback.pointTwoAm' => ['nullable', 'string', 'max:255'],
            'feedback.quote' => ['nullable', 'string', 'max:500'],
            'feedback.quoteAm' => ['nullable', 'string', 'max:500'],

            // 8. Footer
            'footer' => ['nullable', 'array'],
            'footer.enabled' => ['sometimes', 'boolean'],
            'footer.brandTagline' => ['nullable', 'string', 'max:200'],
            'footer.brandTaglineAm' => ['nullable', 'string', 'max:200'],
            'footer.description' => ['nullable', 'string', 'max:1000'],
            'footer.descriptionAm' => ['nullable', 'string', 'max:1000'],
            'footer.adminStripKicker' => ['nullable', 'string', 'max:100'],
            'footer.adminStripKickerAm' => ['nullable', 'string', 'max:100'],
            'footer.adminStripTitle' => ['nullable', 'string', 'max:200'],
            'footer.adminStripTitleAm' => ['nullable', 'string', 'max:200'],
            'footer.adminStripDescription' => ['nullable', 'string', 'max:500'],
            'footer.adminStripDescriptionAm' => ['nullable', 'string', 'max:500'],
            'footer.copyright' => ['nullable', 'string', 'max:200'],
            'footer.copyrightAm' => ['nullable', 'string', 'max:200'],
            'footer.bottomNote' => ['nullable', 'string', 'max:255'],
            'footer.bottomNoteAm' => ['nullable', 'string', 'max:255'],
            'footer.helplinePhone' => ['nullable', 'string', 'max:50'],
        ];
    }
}
