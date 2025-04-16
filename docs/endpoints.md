# Endpoints

## Table of Contents

- [Endpoints](#endpoints)
    - [Table of Contents](#table-of-contents)
    - [Authentication](#authentication)
        - [POST /auth/register](#post-authregister)
            - [Request](#request)
            - [Response](#response)

## Authentication

### POST /auth/register

Register a new user.

#### Request

```json
{
  "username": "john_doe",
  "email": "
    "password": "password"
}
```

#### Response

```json
{
  "id": 1,
  "username": "john_doe",
  "email": ""
}
```

[]