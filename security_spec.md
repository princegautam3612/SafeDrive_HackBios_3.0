# Security Specification

## 1. Data Invariants
- Each user profile `/users/{userId}` belongs strictly to the authenticated user where `request.auth.uid == userId`.
- User PII (email, phone, DL) can only be accessed by the profile owner (`request.auth.uid == userId`).
- Trips `/users/{userId}/trips/{tripId}` and Transactions `/users/{userId}/transactions/{transactionId}` strictly belong to the parent user and require `request.auth.uid == userId`.
- String lengths and type validations are strictly checked to prevent resource exhaustion and prototype pollution.
- Test document `/test/{testId}` is read-only for connectivity checking.

## 2. Dirty Dozen Threat Vectors
1. Spoofed User Write: Unauthenticated write to `/users/user123` -> PERMISSION_DENIED.
2. Cross-User Profile Read: Authenticated user A attempting to read `/users/userB` -> PERMISSION_DENIED.
3. Cross-User Trip Creation: Authenticated user A creating a trip under `/users/userB/trips/trip1` -> PERMISSION_DENIED.
4. Shadow Key Injection: Writing extra hidden privilege keys to UserProfile -> PERMISSION_DENIED.
5. Oversized Payload: Writing a 1MB payload to `name` or `dlNumber` -> PERMISSION_DENIED.
6. Negative Distance Injection: Creating a trip with negative distance -> PERMISSION_DENIED.
7. Score Boundary Bypass: Setting safeScore > 100 or < 0 -> PERMISSION_DENIED.
8. Impersonation of Admin: Modifying role to 'ADMIN' without privileged authorization -> PERMISSION_DENIED.
9. Cross-User Transaction Write: Writing point reward transactions to another user's balance -> PERMISSION_DENIED.
10. Unauthenticated Test Document Write: Writing to `/test/connection` -> PERMISSION_DENIED.
11. Malformed Document ID: Document ID with injection or path characters -> PERMISSION_DENIED.
12. Blanket Query Scraping: Querying collection without `userId` filter -> PERMISSION_DENIED.
