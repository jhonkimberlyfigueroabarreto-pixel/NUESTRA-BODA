# Security Specification for Boda Kimberly & Jhon Firestore Database

## Data Invariants
1. **Unauthenticated Public Access for RSVP**: Guests must be able to search and update their own RSVP records by updating `status`, `notes`, and `wantsReminder`.
2. **Admin Operations**: Since admin authentication is handled client-side using static credentials, the Firestore collection `/guests` needs to accept read and write operations, but we can enforce strict schema constraints.
3. **No Unknown Fields**: Documents in `/guests` can only have the fields defined in our schema.
4. **Data Integrity**: `firstName` and `lastName` cannot be empty. `quota` must be a positive integer >= 1. `status` must be one of "Pendiente", "Confirmado", "No asiste".

## The "Dirty Dozen" Payloads (Prohibited Actions)
1. **Ghost Field Update**: Adding `isVerified: true` to a guest document.
2. **Negative Quota Creation**: Creating a guest with `quota: -5`.
3. **Zero Quota Creation**: Creating a guest with `quota: 0`.
4. **Invalid Status Update**: Updating status to `invalid_status_value`.
5. **Empty Name Creation**: Creating a guest with empty `firstName`.
6. **Missing Code Field**: Creating a guest without a `code` field.
7. **Type Mismatch Phone**: Storing `phone` as a boolean.
8. **Type Mismatch Email**: Storing `email` as an integer.
9. **Type Mismatch WantsReminder**: Storing `wantsReminder` as a string.
10. **Arbitrary Field Insertion**: Adding a random `adminPrivileges: true` field to the guest document.
11. **Empty Code Field**: Creating/updating with an empty `code` string.
12. **Malformed TableName**: Setting `tableName` to an array instead of a string.

## Firestore Security Rules Blueprint
We will write rules in `firestore.rules` that enforce the schema structure and deny any payload that violates these invariants.
