# Seller Compliance TODO

- [x] Remove Store Customization section from seller control center.
- [x] Remove Draft Products entry and route from seller control center.
- [x] Create a dedicated seller screen to upload only:
  - GST Certificate
  - Business License
- [x] Ensure compliance upload does not route to Seller Onboarding.
- [x] Add backend endpoint to accept GST + Business License uploads.
- [x] Save seller-side document status with required lifecycle values:
  - uploaded
  - not_verified
  - verified
  - rejected
- [x] Mark uploaded docs as uploaded and submit them for admin review.
- [x] Auto-create/update seller verification record as pending for admin queue.
- [x] Update admin verify/reject flow to set doc statuses to verified/rejected.
- [x] Update seller compliance screen to display live status for both docs.
- [x] Show rejection reason when admin rejects document verification.

## Notes

- Status display in seller UI uses user complianceDocs values.
- Admin approval continues through the existing seller verification dashboard flow.
