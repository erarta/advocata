# API Integration Guide

This document describes the API endpoints used by the Advocata Admin Panel and their integration patterns.

## Base Configuration

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

### API Client Setup

The API client is configured in `src/lib/api/client.ts` with:

- **Base URL**: From environment variable
- **Timeout**: 30 seconds
- **Content-Type**: application/json
- **Authorization**: Bearer token (auto-injected)

### Request Interceptors

1. **Add Authentication Token**:
   - Retrieves token from localStorage
   - Adds to `Authorization` header as `Bearer {token}`

2. **Error Handling**:
   - 401 Unauthorized: Attempts token refresh, then redirects to login
   - 403 Forbidden: Redirects to unauthorized page
   - 404 Not Found: Shows toast notification
   - 500+ Server Error: Shows error toast

## Authentication Endpoints

### Login

```typescript
POST /admin/auth/login
```

**Request:**
```json
{
  "email": "admin@advocata.ru",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "admin@advocata.ru",
      "fullName": "Admin User",
      "role": "admin",
      "permissions": ["lawyer:view", "lawyer:verify", ...]
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

### Refresh Token

```typescript
POST /admin/auth/refresh
```

**Request:**
```json
{
  "refreshToken": "refresh-token"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-token"
  }
}
```

### Logout

```typescript
POST /admin/auth/logout
```

**Response:**
```json
{
  "success": true
}
```

## Lawyer Management Endpoints

### Get Pending Lawyers

```typescript
GET /admin/lawyers/pending?page=1&limit=20&search=query
```

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "fullName": "Ivan Petrov",
      "email": "ivan@example.com",
      "phoneNumber": "+79991234567",
      "specializations": ["ДТП", "Уголовное право"],
      "experienceYears": 5,
      "licenseNumber": "ABC123456",
      "submittedAt": "2025-11-15T10:30:00Z",
      "ageDays": 3,
      "ageHours": 72,
      "isUrgent": true,
      "documents": [...]
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 20,
  "totalPages": 1
}
```

### Get Lawyer Details

```typescript
GET /admin/lawyers/:id
```

**Response:**
```json
{
  "id": "uuid",
  "fullName": "Ivan Petrov",
  "email": "ivan@example.com",
  "phoneNumber": "+79991234567",
  "status": "pending",
  "specializations": ["ДТП"],
  "experienceYears": 5,
  "licenseNumber": "ABC123456",
  "education": [...],
  "experience": [...],
  "documents": [...],
  "performanceMetrics": {
    "totalConsultations": 0,
    "averageRating": 0,
    "totalEarnings": 0
  }
}
```

### Verify Lawyer

```typescript
POST /admin/lawyers/:id/verify
```

**Request:**
```json
{
  "decision": "approved" | "approved_conditional" | "rejected",
  "conditions": "Optional conditions for conditional approval",
  "rejectionReason": "invalid_license" | "invalid_documents" | ...,
  "additionalComments": "Free text notes",
  "verifiedDocuments": ["doc-id-1", "doc-id-2"],
  "verificationNotes": [
    {
      "note": "All documents verified successfully",
      "adminId": "current-admin-id",
      "adminName": "Admin User"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "lawyer": { /* Updated lawyer object with status: "active" */ }
}
```

### Update Lawyer

```typescript
PATCH /admin/lawyers/:id
```

**Request:**
```json
{
  "fullName": "Updated Name",
  "specializations": ["ДТП", "Семейное право"],
  "hourlyRate": 2500
}
```

**Response:**
```json
{
  "success": true,
  "lawyer": { /* Updated lawyer object */ }
}
```

### Suspend Lawyer

```typescript
POST /admin/lawyers/:id/suspend
```

**Request:**
```json
{
  "reason": "Unprofessional behavior reported",
  "duration": 7 // days (optional, null = indefinite)
}
```

**Response:**
```json
{
  "success": true
}
```

### Ban Lawyer

```typescript
POST /admin/lawyers/:id/ban
```

**Request:**
```json
{
  "reason": "Multiple violations of terms of service",
  "permanent": true
}
```

**Response:**
```json
{
  "success": true
}
```

### Get Lawyer Performance

```typescript
GET /admin/lawyers/performance?period=month
```

**Response:**
```json
{
  "topPerformers": [
    {
      "id": "uuid",
      "fullName": "Top Lawyer",
      "consultationCount": 150,
      "revenue": 450000,
      "rating": 4.9
    }
  ],
  "underperformers": [...],
  "averageMetrics": {
    "totalConsultations": 50,
    "averageRating": 4.5,
    "completionRate": 95
  }
}
```

## User Management Endpoints (TODO)

```typescript
GET /admin/users?page=1&limit=20
GET /admin/users/:id
PATCH /admin/users/:id
POST /admin/users/:id/ban
GET /admin/users/:id/subscriptions
POST /admin/users/:id/subscriptions
```

## Consultation Endpoints (TODO)

```typescript
GET /admin/consultations?page=1&limit=20
GET /admin/consultations/live
GET /admin/consultations/:id
GET /admin/consultations/disputes
POST /admin/consultations/disputes/:id/resolve
GET /admin/consultations/emergency-calls
```

## Analytics Endpoints (TODO)

```typescript
GET /admin/analytics/revenue?period=month
GET /admin/analytics/users?period=month
GET /admin/analytics/lawyers?period=month
POST /admin/analytics/reports/generate
```

## Financial Endpoints (TODO)

```typescript
GET /admin/financial/payouts
POST /admin/financial/payouts/:id/process
POST /admin/financial/refunds
GET /admin/financial/transactions
```

## WebSocket Integration

### Connection

```typescript
const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: localStorage.getItem('admin-token')
  }));
};
```

### Events

```typescript
// Listen for new pending lawyers
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === 'lawyer:pending') {
    // Invalidate pending lawyers query
    queryClient.invalidateQueries({
      queryKey: queryKeys.lawyers.pending()
    });

    // Show notification
    toast({
      title: 'New Lawyer Application',
      description: `${message.data.fullName} submitted an application`
    });
  }
};
```

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "details": {}
  }
}
```

### Common Error Codes

- `UNAUTHORIZED`: Missing or invalid auth token
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Request validation failed
- `INTERNAL_ERROR`: Server error

## Pagination

All list endpoints support pagination with query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `search`: Search query
- `sortBy`: Field to sort by
- `sortOrder`: `asc` or `desc`

## Filtering

List endpoints support filtering:

```typescript
GET /admin/lawyers?status=active&specialization=ДТП&minRating=4.5
```

## Rate Limiting

- **Limit**: 100 requests per minute per user
- **Header**: `X-RateLimit-Remaining`
- **Response**: 429 Too Many Requests

## Testing

Use the mock API client for testing:

```typescript
// src/lib/api/__mocks__/lawyers.ts
export const getPendingLawyers = jest.fn().mockResolvedValue({
  items: mockLawyers,
  total: 10,
  page: 1,
  limit: 20,
  totalPages: 1
});
```

---

**Version**: 1.0.0
**Last Updated**: November 18, 2025
