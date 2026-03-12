# RideMate API Documentation

Simple API guide for backend endpoints.

## Base URL

`http://localhost:8080`

## Authentication

Most APIs require JWT token in header:

`Authorization: Bearer <your_token>`

## Admin User

Admin bootstrap is environment-based (no hardcoded credentials in code).

Set these before app start if you want auto-admin creation:

- `ADMIN_BOOTSTRAP_ENABLED=true`
- `ADMIN_BOOTSTRAP_EMAIL=<admin_email>`
- `ADMIN_BOOTSTRAP_PASSWORD=<admin_password>`
- `ADMIN_BOOTSTRAP_NAME=RideMate Admin` (optional)

Use that admin account for `/admin/**` APIs.

## Error Format

When an API fails, backend usually returns:

```json
{
  "error": "Some error message"
}
```

Common status codes:

- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `409 Conflict` (for duplicate email)

---

## 1. Auth APIs

### 1.1 Register

- Method: `POST`
- URL: `/auth/register`
- Auth required: `No`

Request body:

```json
{
  "name": "Khushi",
  "email": "khushi@example.com",
  "password": "Khushi@123",
  "studentId": "STU001",
  "gender": "Female"
}
```

Success response:

```json
{
  "id": 1,
  "name": "Khushi",
  "email": "khushi@example.com",
  "studentId": "STU001",
  "gender": "Female",
  "vehicleNumber": null,
  "drivingLicense": null,
  "verifiedDriver": false,
  "role": "USER",
  "verificationStatus": null
}
```

### 1.2 Login

- Method: `POST`
- URL: `/auth/login`
- Auth required: `No`

Request body:

```json
{
  "email": "khushi@example.com",
  "password": "Khushi@123"
}
```

Success response:

```json
{
  "token": "<jwt_token>",
  "userId": 1,
  "name": "Khushi",
  "email": "khushi@example.com",
  "role": "USER"
}
```

### 1.3 Current Logged-in User

- Method: `GET`
- URL: `/auth/me`
- Auth required: `Yes`

Request body: `None`

Success response:

```json
{
  "id": 1,
  "name": "Khushi",
  "email": "khushi@example.com",
  "studentId": "STU001",
  "gender": "Female",
  "vehicleNumber": "MH12AB1234",
  "drivingLicense": "DL1234567890123",
  "verifiedDriver": false,
  "role": "USER",
  "verificationStatus": "PENDING"
}
```

---

## 2. User / Driver Verification APIs

### 2.1 Get All Users

- Method: `GET`
- URL: `/users`
- Auth required: `Yes`

Request body: `None`

Success response:

```json
[
  {
    "id": 1,
    "name": "Khushi",
    "email": "khushi@example.com",
    "studentId": "STU001",
    "gender": "Female",
    "vehicleNumber": "MH12AB1234",
    "drivingLicense": "DL1234567890123",
    "verifiedDriver": false,
    "role": "USER",
    "verificationStatus": "PENDING"
  }
]
```

### 2.2 Submit Driver Details

Use this when user wants to become a driver.

- Method: `POST`
- URL: `/users/submit-driver-details`
- Auth required: `Yes`

Request body:

```json
{
  "vehicleNumber": "MH12AB1234",
  "drivingLicense": "DL1234567890123"
}
```

Success response:

```json
{
  "message": "Driver details submitted for verification. You will be notified once verified."
}
```

### 2.3 Check Driver Status

- Method: `GET`
- URL: `/users/driver-status`
- Auth required: `Yes`

Request body: `None`

Success response:

```json
{
  "isVerifiedDriver": false,
  "verificationStatus": "PENDING",
  "vehicleNumber": "MH12AB1234",
  "drivingLicense": "DL1234567890123",
  "detailsSubmitted": true
}
```

`verificationStatus` can be:

- `PENDING`
- `VERIFIED`
- `REJECTED`

---

## 3. Ride APIs

### 3.1 Create Ride

Only a `VERIFIED` driver can create rides.

- Method: `POST`
- URL: `/rides`
- Auth required: `Yes`

Request body:

```json
{
  "source": "VIT Pune",
  "destination": "Swargate",
  "departureTime": "2026-03-14T09:30:00",
  "availableSeats": 3,
  "price": 80
}
```

Success response:

```json
{
  "id": 10,
  "source": "VIT Pune",
  "destination": "Swargate",
  "departureTime": "2026-03-14T09:30:00",
  "availableSeats": 3,
  "price": 80.0,
  "status": "ACTIVE",
  "driver": {
    "id": 1,
    "name": "Khushi",
    "email": "khushi@example.com"
  }
}
```

### 3.2 Search Rides

Find rides by source and destination (case-insensitive partial match).

- Method: `POST`
- URL: `/rides/search`
- Auth required: `Yes`

Request body:

```json
{
  "source": "vit",
  "destination": "swargate"
}
```

Success response:

```json
[
  {
    "id": 10,
    "source": "VIT Pune",
    "destination": "Swargate",
    "departureTime": "2026-03-14T09:30:00",
    "availableSeats": 2,
    "price": 80.0,
    "status": "ACTIVE"
  }
]
```

### 3.3 Get All Active Rides

- Method: `GET`
- URL: `/rides`
- Auth required: `Yes`

Request body: `None`

Success response: array of ride objects (same shape as above).

### 3.4 Get My Created Rides

- Method: `GET`
- URL: `/rides/my-rides`
- Auth required: `Yes`

Request body: `None`

Success response: array of your rides.

### 3.5 Cancel My Ride

- Method: `PUT`
- URL: `/rides/{rideId}/cancel`
- Auth required: `Yes`

Request body: `None`

Success response:

```json
{
  "id": 10,
  "status": "CANCELLED"
}
```

---

## 4. Booking APIs

### 4.1 Book a Ride

- Method: `POST`
- URL: `/bookings`
- Auth required: `Yes`

Request body:

```json
{
  "rideId": 10,
  "seats": 1
}
```

Success response:

```json
{
  "id": 50,
  "seatsBooked": 1,
  "status": "CONFIRMED",
  "ride": {
    "id": 10,
    "source": "VIT Pune",
    "destination": "Swargate"
  },
  "user": {
    "id": 2,
    "name": "Rahul",
    "email": "rahul@example.com"
  }
}
```

### 4.2 Get My Bookings

- Method: `GET`
- URL: `/bookings/my-bookings`
- Auth required: `Yes`

Request body: `None`

Success response: array of booking objects.

### 4.3 Cancel My Booking

- Method: `PUT`
- URL: `/bookings/{bookingId}/cancel`
- Auth required: `Yes`

Request body: `None`

Success response:

```json
{
  "id": 50,
  "seatsBooked": 1,
  "status": "CANCELLED"
}
```

---

## 5. Admin Driver Verification APIs

All endpoints below require an `ADMIN` token.

### 5.1 Get Pending Driver Requests

- Method: `GET`
- URL: `/admin/driver-verifications/pending`
- Auth required: `Yes (ADMIN)`

Request body: `None`

Success response:

```json
[
  {
    "userId": 2,
    "name": "Rahul",
    "email": "rahul@example.com",
    "studentId": "STU002",
    "vehicleNumber": "MH14XY5678",
    "drivingLicense": "DL9988776655443",
    "verificationStatus": "PENDING"
  }
]
```

### 5.2 Approve Driver Request

- Method: `PUT`
- URL: `/admin/driver-verifications/{userId}/approve`
- Auth required: `Yes (ADMIN)`

Request body: `None`

Success response:

```json
{
  "message": "Driver request approved for user Rahul"
}
```

### 5.3 Reject Driver Request

- Method: `PUT`
- URL: `/admin/driver-verifications/{userId}/reject`
- Auth required: `Yes (ADMIN)`

Request body: `None`

Success response:

```json
{
  "message": "Driver request rejected for user Rahul"
}
```

---

## Quick Testing Flow (Recommended)

1. Register a normal user
2. Login and copy token
3. Submit driver details (`/users/submit-driver-details`)
4. Login as configured admin user
5. See pending list (`/admin/driver-verifications/pending`)
6. Approve request
7. Login again as user and create ride (`/rides`)
8. Login as another user and book that ride (`/bookings`)
