# Architecture

## Concept
Plan → Study → Record → Analyze → Improve

## Frontend Architecture
```
Pages → Components → Hooks → Services/API → Backend
```

## Backend Architecture
```
Route → Middleware → Controller → Request Validation → Service → Model → Database
```

## Auth
Laravel Sanctum (token-based). Role: `user`, `admin`.

## Data Isolation
Every query scoped to `auth()->id()`. Never accept `user_id` from client.

## API Response Format
```json
{ "success": true, "message": "...", "data": {} }
{ "success": false, "message": "...", "errors": {} }
```
