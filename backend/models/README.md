# Models Documentation

This directory contains all database models organized in a modular way.

## Structure

Each database table is in its own file for better organization and maintainability.

```
models/
├── __init__.py              # SQLAlchemy initialization and exports
├── organization.py          # Organizations/Clinics model
├── user.py                  # System users model
├── subscription.py          # Subscription and billing model
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

### 3. Subscription (subscriptions)
Manages organization subscriptions, billing, and plan limits.
Integrates with LemonSqueezy for payment processing.

**Main fields:**
- `organization_id`: Reference to organization (unique)
- `plan_name`: Plan type (free, basic, premium, enterprise)
- `plan_price`: Price in USD
- `billing_cycle`: monthly or yearly
- `status`: trial, active, past_due, canceled, paused
- `lemonsqueezy_subscription_id`: LemonSqueezy integration
- `max_users`, `max_patients`: Plan limits

**Methods:**
- `to_dict()`: Convert to JSON with computed properties
- `create(org_id, plan_name)`: Create with default limits
- `change_plan(plan_name)`: Upgrade/downgrade plan
- `activate()`: Activate subscription
- `cancel()`: Cancel subscription
- `pause()`: Pause subscription
- `mark_past_due()`: Mark as past due
- `can_add_user()`: Check if can add more users
- `can_add_patient()`: Check if can add more patients
- `find_by_organization(org_id)`: Find by organization
- `find_by_lemonsqueezy_id(id)`: Find by LemonSqueezy ID
- `get_active_subscriptions()`: Get all active
- `get_expiring_soon(days)`: Get expiring subscriptions
- `get_plan_limits(plan_name)`: Get default limits for plan

**Properties:**
- `is_active`: Check if subscription is active
- `is_trial`: Check if in trial period
- `is_expired`: Check if expired
- `days_until_expiry`: Days remaining
- `is_paid_plan`: Check if paid plan

**Plan Limits:**
- Free: 1 user, 50 patients
- Basic: 3 users, 200 patients
- Premium: 10 users, 1000 patients
- Enterprise: 999 users, 999999 patients

## Usage

### Import models:
```python
from models import db, Organization, User, Subscription
```

### Create organization with subscription:
```python
# Create organization
org = Organization.create(
    name="Medical Clinic",
    email="contact@clinic.com",
    city="Quito"
)

# Create free subscription for new organization
subscription = Subscription.create(
    organization_id=org.id,
    plan_name='free',
    status='trial'
)
```

### Subscription management:
```python
# Get subscription
sub = Subscription.find_by_organization(org_id=1)

# Upgrade plan
sub.change_plan('premium', billing_cycle='yearly')

# Activate subscription
from datetime import datetime, timedelta
sub.activate(
    period_start=datetime.utcnow(),
    period_end=datetime.utcnow() + timedelta(days=30)
)

# Check limits
if sub.can_add_user():
    # Create user...
    pass

# Check subscription status
if sub.is_active:
    print(f"Days remaining: {sub.days_until_expiry}")

# Cancel subscription
sub.cancel()
```

### LemonSqueezy integration:
```python
# Update with LemonSqueezy data
sub.update(
    lemonsqueezy_subscription_id="ls_sub_123456",
    lemonsqueezy_customer_id="ls_cust_789",
    lemonsqueezy_variant_id="ls_var_premium_monthly"
)

# Find by LemonSqueezy ID
sub = Subscription.find_by_lemonsqueezy_id("ls_sub_123456")
```

### Query subscriptions:
```python
# Get all active subscriptions
active = Subscription.get_active_subscriptions()

# Get subscriptions expiring in 7 days
expiring = Subscription.get_expiring_soon(days=7)
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
