# RiverSpend Control — Foundation

## Purpose
RiverSpend Control is a standalone, mobile-first CEO/admin application. It is separate from RiverSpendShop (RSShop), while sharing a secure backend and identity/data foundation where appropriate. This document is a product and implementation specification; it does not claim that the application is already implemented.

## Product surfaces
- **RiverSpendShop:** customer and seller marketplace.
- **RiverSpend Control:** CEO command center and internal operations.
- **RiverSpend Business:** partner portal for verified companies, scoped to their own records and shared operations.

## CEO authority and access
- First account is provisioned as the owner/CEO through a secure, one-time setup process; never hard-code a password or expose secrets in source control.
- Individual accounts for every person; no shared passwords.
- Invitation/registration requests remain pending until CEO approval.
- Server-enforced roles and permissions; UI hiding alone is not authorization.
- CEO can approve, suspend, block, and revoke access; changes take effect server-side.
- MFA recommended/required for privileged roles.
- Immutable or append-only audit history for sign-ins, approvals, permission changes, financial actions, inventory changes, and shipment milestones.
- Least-privilege access; partners can see only their company and explicitly shared shipments/documents.

## Main Control modules
1. **CEO Overview:** sales, received funds, refunds, fees, net position, alerts and operational summaries; distinguish gross sales from cash received and net balance.
2. **People & Access:** pending requests, invitations, users, roles, permissions, company membership, suspend/revoke, audit trail.
3. **Finance & Payments:** supplier invoices (VAT-registered businesses), employee and collaborator payments, due dates, expenses, marketplace receipts, refunds, reconciliation and reports. Record status and evidence. Actual transfers require an authorized banking/payment integration and explicit approval; no simulated payments.
4. **Business Partners:** company profile, legal identifiers, verification status, contacts, contracts/documents and scoped access.
5. **Warehouses & Inventory:** locations, SKU/lot, quantities and condition, receiving, dispatch, transfers, returns, discrepancies and stock movement history.
6. **Shipments & Containers:** container IDs/seals, booking and transport references, origin/destination, assigned warehouse, carrier-provided milestones/ETA, documents/customs status, receipt quantities and damage/missing reports. Clearly label manual vs carrier-sourced updates; never invent live tracking.
7. **Nova — Vigilante:** anomaly and deadline alerts, discrepancy detection, activity summaries and recommendations. High-impact actions (blocking a user, approving a payment, changing permissions) remain subject to CEO/authorized human confirmation.
8. **Meetings:** planned integration for invitations, calendar, group calls, screen sharing and notes; recording only with appropriate notice and consent.

## Security and data principles
- Authenticate every request and authorize every operation on the server.
- Tenant/company isolation for partner data.
- Store secrets only in managed environment variables; never commit credentials.
- Validate and log financial and inventory state transitions.
- Keep a clear distinction between proposed, approved, submitted, settled, failed and reconciled payment states.
- Design privacy, retention, and applicable accounting/tax workflows with qualified professional review.

## Delivery sequence
1. Audit current repository, deployment, Supabase configuration, data model and existing auth without changing production.
2. Build Control as a separate app surface in an isolated branch/preview.
3. Implement identity, CEO bootstrap, approval workflow, roles, server-side authorization and audit log.
4. Add read-only CEO overview against verified data.
5. Add finance records and approval workflow; connect payment rails only after security and compliance review.
6. Add warehouses, inventory, partner portal and shipment/container lifecycle.
7. Add Nova alerting and then meetings integration.
8. Test access boundaries, financial states, recovery, mobile layouts and deployment before production release.

## Acceptance gates
- RSShop production remains untouched until preview has been reviewed.
- A non-approved user cannot enter Control or call protected APIs.
- A partner cannot access another partner's data by changing a URL or request.
- Revoked access is rejected server-side.
- Financial totals reconcile to source transactions and are not conflated.
- Stock changes only after a verified receiving/dispatch event.
- All privileged actions have an attributable audit record.
