# Models Documentation

This directory contains all database models organized in a modular way.

## Structure

Each database table is in its own file for better organization and maintainability.

```
models/
├── __init__.py              # SQLAlchemy initialization and exports
├── organization.py          # Organizations/Clinics model
├── user.py                  # System users model
└── (more models coming)
```

## Current Models

### 1. Organization (organizations)
Represents organizations or clinics using the system.

**Main fields:**
- `name`: Organization name
- `legal_name`: Legal name
- `tax_id`: Tax ID or RUC
- `email`, `phone`, `website`: Contact information
- Complete address (address_line1, city, state, etc.)
- Configuration (timezone, currency)
- Branding (logo_url, primary_color)

**Methods:**
- `to_dict()`: Convert to JSON dictionary
- `create()`: Create new organization
- `update()`: Update data
- `delete()`: Soft delete (mark as inactive)
- `hard_delete()`: Permanently delete

### 2. User (users)
Represents system users with authentication and profile.

**Main fields:**
- `organization_id`: Reference to organization
- `username`, `email`: Unique credentials
- `password_hash`: Hashed password
- `first_name`, `last_name`: Personal information
- `phone`, `photo_url`: Optional contact and profile
- `reset_token`, `reset_token_expires`: Password recovery

**Methods:**
- `to_dict(include_sensitive=False)`: Convert to JSON
- `create(password, **kwargs)`: Create with hashed password
- `set_password(password)`: Update password
- `check_password(password)`: Verify password
- `generate_reset_token()`: Generate reset token
- `verify_reset_token(token)`: Verify reset token
- `clear_reset_token()`: Clear reset token
- `find_by_email(email)`: Find user by email
- `find_by_username(username)`: Find user by username
- `find_by_organization(org_id)`: Get all users in org

**Properties:**
- `full_name`: Returns first_name + last_name

## Usage

### Import models:
```python
from models import db, Organization, User
```

### Create a user:
```python
# First, get or create organization
org = Organization.query.get(1)

# Create user with password
user = User.create(
    organization_id=org.id,
    username="jdoe",
    email="john.doe@example.com",
    password="SecurePassword123!",
    first_name="John",
    last_name="Doe",
    phone="+593 99 123 4567"
)
```

### Authenticate user:
```python
# Find user
user = User.find_by_email("john.doe@example.com")

# Verify password
if user and user.check_password("SecurePassword123!"):
    print(f"Welcome {user.full_name}!")
else:
    print("Invalid credentials")
```

### Password reset flow:
```python
# Generate reset token
user = User.find_by_email("john.doe@example.com")
token = user.generate_reset_token()
# Send token via email...

# Later, verify and reset
if user.verify_reset_token(token):
    user.set_password("NewPassword123!")
    user.clear_reset_token()
```

### Query users:
```python
# All active users in organization
users = User.find_by_organization(org_id=1, active_only=True)

# By username
user = User.find_by_username("jdoe")

# By email
user = User.find_by_email("john.doe@example.com")
```

### Update user:
```python
user = User.query.get(1)
user.update(
    phone="+593 99 999 9999",
    photo_url="https://example.com/photo.jpg"
)
```

## Next Models

The following models will be added progressively:
- [ ] Roles (user roles and permissions)
- [ ] Patients
- [ ] Doctors
- [ ] Appointments
- [ ] Medical Records
- [ ] Invoices
- [ ] Payments
- And more...

## Migrations

To create tables in the database:

```bash
cd backend
source .venv/bin/activate
python create_tables.py
```

## Conventions

1. **File names**: snake_case (e.g., `user.py`)
2. **Class names**: PascalCase (e.g., `User`)
3. **Table names**: plural snake_case (e.g., `users`)
4. **Timestamps**: Always include `created_at` and `updated_at`
5. **Soft deletes**: Use `is_active` to mark active/inactive records
6. **Helper methods**: Include `to_dict()`, `create()`, `update()`, `delete()`
7. **Comments**: All comments and docstrings in English
8. **Indexes**: Add indexes on foreign keys and frequently queried fields
