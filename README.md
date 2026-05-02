# 🚗 RideMate - Carpooling for Students

Full-stack ride-sharing application enabling students to share rides, split costs, and reduce carbon footprint. Built with microservices-ready architecture and production-grade patterns.

## 🎯 Core Features

- **Geospatial Ride Matching** - Location-based search with Haversine distance calculation
- **Secure Payments** - Razorpay integration with signature verification & refund handling
- **Real-time Notifications** - WebSocket (STOMP) for instant booking updates
- **Post-Ride Star Rating** - Frontend 5-star rating with optional feedback, persisted per ride in `localStorage`
- **Strict Form Validation** - Register page enforces regex rules for name, email, password (upper/lower/digit/special), 10-digit phone, and 11-digit numeric student ID
- **JWT Authentication** - Stateless auth with BCrypt password hashing

## 🏗️ System Architecture

### Backend Structure
```
├── entity/           JPA entities with optimized relationships
├── repository/       Spring Data JPA + custom native queries
├── service/          Business logic with @Transactional management
├── controller/       RESTful API endpoints with DTO mapping
├── security/         JWT filter chain + method-level authorization
└── config/           WebSocket, CORS, security configurations
```

**Design Patterns**: Repository, Service Layer, DTO, Dependency Injection, Factory

### Technology Stack

| Component | Technology |
|-----------|------------|
| **Backend** | Java 21, Spring Boot 3.5, Hibernate/JPA |
| **Database** | PostgreSQL (Neon), HikariCP connection pooling |
| **Security** | JWT (RS256), Spring Security, BCrypt |
| **Real-time** | WebSocket (STOMP protocol), SockJS fallback |
| **Payments** | Razorpay SDK, HMAC-SHA256 verification |
| **Frontend** | TypeScript, Next.js 14 App Router |
| **Mapping** | Mapcn, OpenState map API |

## 🗄️ Database Design

**5 Core Tables** with normalized schema:

```
users                  1:N vehicles
  ├─ id (PK)              ├─ id (PK)
  ├─ email (UK)           ├─ user_id (FK)
  ├─ phone (UK)           └─ license_plate (UK)
  ├─ driver_rating              ↓
  └─ passenger_rating       1:N rides
                              ├─ id (PK)
                              ├─ driver_id (FK)
                              ├─ vehicle_id (FK)
                              ├─ origin_lat, origin_lng
                              ├─ dest_lat, dest_lng
                              └─ status (enum)
                                    ↓
                                1:N bookings
                                  ├─ id (PK)
                                  ├─ ride_id (FK)
                                  ├─ passenger_id (FK)
                                  ├─ payment_status
                                  └─ razorpay_order_id
                                        ↓
                                    1:2 reviews
                                      ├─ id (PK)
                                      ├─ booking_id (FK)
                                      ├─ reviewer_id (FK)
                                      ├─ reviewee_id (FK)
                                      └─ rating (1-5)
```

**Optimizations**: B-tree indexes on FKs, unique constraints, lazy loading for relationships

## 🔐 Security Implementation

- **Authentication**: JWT with 24h access tokens + refresh tokens
- **Authorization**: Role-based access control (RBAC) with `@PreAuthorize`
- **Password Storage**: BCrypt with salt rounds (strength 12)
- **API Security**: CORS configured, CSRF disabled (stateless JWT)
- **Input Validation**: JSR-303 Bean Validation on DTOs
- **SQL Injection Prevention**: JPA named parameters

## 🚀 Key API Endpoints

See [api.md](api.md) for the full reference. Highlights:

```
POST   /auth/register                                  Register new user
POST   /auth/login                                     Issue JWT token
GET    /auth/me                                        Current user profile

POST   /users/submit-driver-details                    Apply to become a driver
GET    /users/driver-status                            Check driver verification status
GET    /users                                          List all users (ADMIN)

POST   /rides                                          Create ride (verified driver)
POST   /rides/search                                   Geospatial ride search
GET    /rides                                          List active rides
GET    /rides/my-rides                                 Driver's own rides
PUT    /rides/{id}/cancel                              Cancel a ride
POST   /rides/{id}/start                               Start a ride
POST   /rides/{id}/end                                 End a ride

POST   /bookings                                       Book a ride
GET    /bookings/my-bookings                           Passenger booking history
GET    /bookings/my-current                            Active booking
GET    /bookings/driver/ride/{rideId}                  Driver view of bookings
GET    /bookings/ride/{rideId}/participants            Ride participant list
PUT    /bookings/{id}/cancel                           Cancel booking
PUT    /bookings/{id}/pickup                           Mark passenger picked up (OTP)
PUT    /bookings/{id}/drop                             Mark passenger dropped

POST   /bookings/{id}/payments/razorpay/order          Create Razorpay order
POST   /bookings/{id}/payments/razorpay/verify         Verify Razorpay payment

GET    /admin/driver-verifications/pending             Pending driver applications
PUT    /admin/driver-verifications/{userId}/approve    Approve driver
PUT    /admin/driver-verifications/{userId}/reject     Reject driver
```

## 📡 Real-time Features

**WebSocket Channels**:
- `/topic/rides` - Broadcast ride updates
- `/queue/user/{userId}/notifications` - Personal notifications

**Event Types**: `BOOKING_REQUEST`, `BOOKING_ACCEPTED`, `BOOKING_REJECTED`, `RIDE_CANCELLED`, `PAYMENT_SUCCESS`, `PAYMENT_FAILED`

## ⚡ Performance & Scalability

- **Query Optimization**: Custom JPQL with pagination, indexed columns
- **Connection Pooling**: HikariCP (max 10 connections, 30s timeout)
- **Lazy Loading**: `FetchType.LAZY` for all relationships
- **DTO Pattern**: Prevents entity exposure, reduces payload size
- **Transaction Management**: `@Transactional` with ACID guarantees
- **Horizontal Scaling**: Stateless JWT enables load balancing

## 🧪 Quality Assurance

- **Unit Tests**: Service layer with Mockito
- **Integration Tests**: `@SpringBootTest` with `MockMvc`
- **Repository Tests**: H2 in-memory for JPA queries
- **API Tests**: Postman collection with automated scenarios

## 🚀 Deployment Architecture

**Backend**: Render / Heroku   
**Frontend**: Vercel (Edge network, SSR)  
**Database**: Neon PostgreSQL (auto-scaling, daily backups)

## 🔧 Local Development

```bash
# Clone repository
git clone <repo-url>

# Backend setup
cd backend
./mvnw spring-boot:run

# Frontend setup
cd frontend
npm install && npm run dev

# Environment variables
DATABASE_URL=<neon-connection-string>
JWT_SECRET=<256-bit-secret>
RAZORPAY_KEY_ID=<key>
RAZORPAY_KEY_SECRET=<secret>
```

## 📈 Future Enhancements

- [ ] Redis caching for frequent ride searches
- [ ] Elasticsearch for full-text search
- [ ] Apache Kafka for event streaming
- [ ] Rate limiting with Redis + Spring AOP
- [ ] Grafana dashboards for metrics visualization
