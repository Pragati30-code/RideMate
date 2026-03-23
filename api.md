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

## Ride Status Flow

```
ACTIVE → FULL (auto, when availableSeats hits 0)
FULL → ACTIVE (auto, when a passenger cancels and a seat frees up)
ACTIVE / FULL → IN_PROGRESS (driver calls POST /rides/{id}/start)
IN_PROGRESS → COMPLETED (driver calls POST /rides/{id}/end)
ACTIVE / FULL → CANCELLED (driver calls PUT /rides/{id}/cancel)
```

## Booking Status Flow

```
CONFIRMED → PICKED_UP (driver calls PUT /bookings/{id}/pickup)
PICKED_UP → DROPPED   (driver calls PUT /bookings/{id}/drop)
CONFIRMED → CANCELLED (passenger calls PUT /bookings/{id}/cancel)
```

## Fare Calculation

Fare is **auto-calculated by the system** — drivers do not set a price.

- Rate: **₹8 per km**
- Distance: straight-line (Haversine) between passenger's pickup and drop coordinates
- Formula: `segmentDistanceKm × ₹8 × seats`
- Shown at search time in `estimatedFare` on each result
- Locked in and stored on the booking at the time of booking

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

Only a `VERIFIED` driver can create rides. **Drivers do not set a price** — fare is auto-calculated per passenger based on their segment distance at ₹8/km.

- Method: `POST`
- URL: `/rides`
- Auth required: `Yes`

Request body:

```json
{
  "source": "VIT Pune",
  "sourceLatitude": 18.4636,
  "sourceLongitude": 73.8670,
  "destination": "Swargate",
  "destinationLatitude": 18.5018,
  "destinationLongitude": 73.8636,
  "departureTime": "2026-03-14T09:30:00",
  "availableSeats": 3
}
```

Notes:
- `sourceLatitude` / `destinationLatitude` must be between `-90` and `90`
- `sourceLongitude` / `destinationLongitude` must be between `-180` and `180`
- Coordinates are required for search and fare calculation

Success response:

```json
{
  "id": 10,
  "source": "VIT Pune",
  "sourceLatitude": 18.4636,
  "sourceLongitude": 73.8670,
  "destination": "Swargate",
  "destinationLatitude": 18.5018,
  "destinationLongitude": 73.8636,
  "departureTime": "2026-03-14T09:30:00",
  "availableSeats": 3,
  "distanceKm": 4.73,
  "status": "ACTIVE",
  "driver": {
    "id": 1,
    "name": "Khushi",
    "email": "khushi@example.com"
  }
}
```

### 3.2 Search Rides

Find rides whose source is within **5 km** of the passenger's pickup, and whose destination is within **5 km** of the passenger's drop. Returns both `ACTIVE` and `FULL` rides (full rides are shown in case a seat frees up via cancellation).

Each result includes the estimated fare for the passenger's specific segment.

- Method: `POST`
- URL: `/rides/search`
- Auth required: `Yes`

Request body:

```json
{
  "source": "VIT Pune",
  "sourceLatitude": 18.4636,
  "sourceLongitude": 73.8670,
  "destination": "Swargate",
  "destinationLatitude": 18.5018,
  "destinationLongitude": 73.8636
}
```

Notes:
- `source` and `destination` strings are for display only — matching is done using coordinates
- All four coordinate fields are required

Success response:

```json
[
  {
    "ride": {
      "id": 10,
      "source": "VIT Pune",
      "sourceLatitude": 18.4636,
      "sourceLongitude": 73.8670,
      "destination": "Swargate",
      "destinationLatitude": 18.5018,
      "destinationLongitude": 73.8636,
      "departureTime": "2026-03-14T09:30:00",
      "availableSeats": 2,
      "distanceKm": 4.73,
      "status": "ACTIVE",
      "driver": {
        "id": 1,
        "name": "Khushi",
        "email": "khushi@example.com"
      }
    },
    "estimatedFare": 37.84,
    "segmentDistanceKm": 4.73
  }
]
```

### 3.3 Get All Active Rides

- Method: `GET`
- URL: `/rides`
- Auth required: `Yes`

Request body: `None`

Success response: array of ride objects (same shape as 3.1 response).

### 3.4 Get My Created Rides

- Method: `GET`
- URL: `/rides/my-rides`
- Auth required: `Yes`

Request body: `None`

Success response: array of your rides.

### 3.5 Cancel My Ride

Only works if ride is `ACTIVE` or `FULL`. Cannot cancel a ride that is `IN_PROGRESS` or `COMPLETED`.

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

### 3.6 Start Ride

Driver manually starts the ride when departing. Ride must be `ACTIVE` or `FULL`.

- Method: `POST`
- URL: `/rides/{rideId}/start`
- Auth required: `Yes`

Request body: `None`

Success response:

```json
{
  "id": 10,
  "status": "IN_PROGRESS",
  "startedAt": "2026-03-14T09:31:00"
}
```

### 3.7 End Ride

Driver ends the ride after all passengers have been dropped. Ride must be `IN_PROGRESS`.

- Method: `POST`
- URL: `/rides/{rideId}/end`
- Auth required: `Yes`

Request body: `None`

Success response:

```json
{
  "id": 10,
  "status": "COMPLETED",
  "endedAt": "2026-03-14T10:05:00"
}
```

---

## 4. Booking APIs

### 4.1 Book a Ride

Passenger provides their specific pickup and drop stop (name + coordinates). Fare is calculated automatically for this segment.

Bookings are blocked if ride status is `IN_PROGRESS`, `COMPLETED`, or `CANCELLED`. If ride is `FULL`, booking is also blocked (a seat must free up first via cancellation).

- Method: `POST`
- URL: `/bookings`
- Auth required: `Yes`

Request body:

```json
{
  "rideId": 10,
  "seats": 1,
  "pickupName": "VIT Pune Gate",
  "pickupLatitude": 18.4636,
  "pickupLongitude": 73.8670,
  "dropName": "Swargate Bus Stand",
  "dropLatitude": 18.5018,
  "dropLongitude": 73.8636
}
```

Success response:

```json
{
  "id": 50,
  "seatsBooked": 1,
  "status": "CONFIRMED",
  "pickupName": "VIT Pune Gate",
  "pickupLatitude": 18.4636,
  "pickupLongitude": 73.8670,
  "dropName": "Swargate Bus Stand",
  "dropLatitude": 18.5018,
  "dropLongitude": 73.8636,
  "segmentDistanceKm": 4.73,
  "estimatedFare": 37.84,
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

Success response: array of booking objects (same shape as 4.1 response).

### 4.3 Cancel My Booking

Only works if booking is `CONFIRMED`. Cannot cancel if status is `PICKED_UP` or `DROPPED`. Cancelling automatically restores the seat on the ride, and flips ride status from `FULL` back to `ACTIVE` if applicable.

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

### 4.4 Mark Passenger as Picked Up

Driver marks a specific passenger's booking as picked up. Ride must be `IN_PROGRESS`.

- Method: `PUT`
- URL: `/bookings/{bookingId}/pickup`
- Auth required: `Yes (must be the ride's driver)`

Request body: `None`

Success response:

```json
{
  "id": 50,
  "status": "PICKED_UP"
}
```

### 4.5 Mark Passenger as Dropped

Driver marks a specific passenger's booking as dropped. Booking must be `PICKED_UP`.

- Method: `PUT`
- URL: `/bookings/{bookingId}/drop`
- Auth required: `Yes (must be the ride's driver)`

Request body: `None`

Success response:

```json
{
  "id": 50,
  "status": "DROPPED"
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

1. Register a normal user (Khushi)
2. Login as Khushi and copy token
3. Submit driver details (`/users/submit-driver-details`)
4. Login as configured admin user
5. See pending list (`/admin/driver-verifications/pending`)
6. Approve Khushi's request
7. Login again as Khushi and create a ride (`/rides`) — no price field needed
8. Register and login as another user (Rahul)
9. Search rides with Rahul's pickup + drop coordinates (`/rides/search`) — note `estimatedFare` in results
10. Book the ride with pickup/drop details (`/bookings`)
11. Login as Khushi and start the ride (`/rides/{id}/start`)
12. Mark Rahul as picked up (`/bookings/{id}/pickup`)
13. Mark Rahul as dropped (`/bookings/{id}/drop`)
14. End the ride (`/rides/{id}/end`)
