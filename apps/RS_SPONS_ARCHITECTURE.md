# RS Spons — Video Advertising Architecture

RS Spons is the RiverSpend advertising layer for RiverSpendShop Web, RiverSpendShop App and RSPC.

## Rules

- User-uploaded product videos remain unchanged.
- Sponsored videos are separate advertising media and must be clearly labelled as advertising.
- Only advertiser-authorized/licensed creative may be distributed.
- Never copy or scrape third-party adverts without permission.
- Advertising placement must not silently alter a seller's original media.
- RSPC is the control point for campaign approval, scheduling and reporting.

## Initial placements

1. Pre-roll: optional sponsored video before eligible video content.
2. Mid-roll: optional sponsored video during longer content, subject to frequency rules.
3. Feed insertion: sponsored video card between marketplace content.
4. Product-page sponsorship: clearly labelled sponsored placement.

## Campaign model

Campaign fields:

- advertiser
- campaign name
- creative URL
- destination URL
- start/end time
- countries
- categories
- budget
- impression cap
- frequency cap
- status
- approval status

## Measurement

Track, where legally permitted:

- impressions
- starts
- 25/50/75/100% completion
- clicks
- destination opens
- campaign spend
- placement
- timestamp

Do not collect unnecessary personal data. Consent, privacy and applicable advertising rules must be respected.

## RSPC controls

CEO/authorized collaborators will be able to:

- create and review campaigns
- approve/reject creatives
- activate/pause campaigns
- define targeting and limits
- inspect performance
- manage advertiser access
- audit campaign changes

## Implementation order

1. Data model/API
2. RSPC campaign management
3. Web sponsored-video placement
4. RiverSpendShop mobile placement
5. Analytics and billing
6. Frequency/eligibility safeguards

This specification intentionally does not embed external advertising videos directly into seller uploads.
