from datetime import datetime
from decimal import Decimal
from models import db


class Subscription(db.Model):
    """
    Subscription model for organization billing and plan management.
    Integrates with LemonSqueezy for payment processing.
    """
    __tablename__ = 'subscriptions'
    
    # Primary Key
    id = db.Column(db.Integer, primary_key=True)
    
    # Foreign Keys
    organization_id = db.Column(
        db.Integer,
        db.ForeignKey('organizations.id', ondelete='CASCADE'),
        unique=True,
        nullable=False
    )
    
    # Plan Details
    plan_name = db.Column(db.String(50), nullable=False, default='free')
    # Options: 'free', 'basic', 'premium', 'enterprise'
    plan_price = db.Column(db.Numeric(10, 2), default=Decimal('0.00'))
    billing_cycle = db.Column(db.String(20), default='monthly')
    # Options: 'monthly', 'yearly'
    
    # Status
    status = db.Column(db.String(20), nullable=False, default='trial', index=True)
    # Options: 'trial', 'active', 'past_due', 'canceled', 'paused'
    
    # Dates
    trial_end_date = db.Column(db.DateTime)
    current_period_start = db.Column(db.DateTime)
    current_period_end = db.Column(db.DateTime)
    canceled_at = db.Column(db.DateTime)
    
    # LemonSqueezy Integration
    lemonsqueezy_subscription_id = db.Column(db.String(100), unique=True)
    lemonsqueezy_customer_id = db.Column(db.String(100))
    lemonsqueezy_variant_id = db.Column(db.String(100))
    
    # Plan Limits
    max_users = db.Column(db.Integer, default=1)
    max_patients = db.Column(db.Integer, default=50)
    
    # Timestamps
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    organization = db.relationship('Organization', backref=db.backref('subscription', uselist=False))
    
    # Plan constants
    PLAN_FREE = 'free'
    PLAN_BASIC = 'basic'
    PLAN_PREMIUM = 'premium'
    PLAN_ENTERPRISE = 'enterprise'
    
    PLANS = [PLAN_FREE, PLAN_BASIC, PLAN_PREMIUM, PLAN_ENTERPRISE]
    
    # Status constants
    STATUS_TRIAL = 'trial'
    STATUS_ACTIVE = 'active'
    STATUS_PAST_DUE = 'past_due'
    STATUS_CANCELED = 'canceled'
    STATUS_PAUSED = 'paused'
    
    STATUSES = [STATUS_TRIAL, STATUS_ACTIVE, STATUS_PAST_DUE, STATUS_CANCELED, STATUS_PAUSED]
    
    # Billing cycle constants
    CYCLE_MONTHLY = 'monthly'
    CYCLE_YEARLY = 'yearly'
    
    CYCLES = [CYCLE_MONTHLY, CYCLE_YEARLY]
    
    def __repr__(self):
        return f'<Subscription org={self.organization_id} plan={self.plan_name} status={self.status}>'
    
    @property
    def is_active(self):
        """Check if subscription is currently active"""
        return self.status in [self.STATUS_TRIAL, self.STATUS_ACTIVE]
    
    @property
    def is_trial(self):
        """Check if subscription is in trial period"""
        return self.status == self.STATUS_TRIAL
    
    @property
    def is_expired(self):
        """Check if subscription has expired"""
        if not self.current_period_end:
            return False
        return datetime.utcnow() > self.current_period_end
    
    @property
    def days_until_expiry(self):
        """Calculate days until subscription expires"""
        if not self.current_period_end:
            return None
        delta = self.current_period_end - datetime.utcnow()
        return max(0, delta.days)
    
    @property
    def is_paid_plan(self):
        """Check if this is a paid plan"""
        return self.plan_name != self.PLAN_FREE
    
    def to_dict(self):
        """Convert model to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'organization_id': self.organization_id,
            'plan': {
                'name': self.plan_name,
                'price': float(self.plan_price) if self.plan_price else 0.00,
                'billing_cycle': self.billing_cycle
            },
            'status': self.status,
            'is_active': self.is_active,
            'is_trial': self.is_trial,
            'is_expired': self.is_expired,
            'dates': {
                'trial_end': self.trial_end_date.isoformat() if self.trial_end_date else None,
                'current_period_start': self.current_period_start.isoformat() if self.current_period_start else None,
                'current_period_end': self.current_period_end.isoformat() if self.current_period_end else None,
                'canceled_at': self.canceled_at.isoformat() if self.canceled_at else None,
                'days_until_expiry': self.days_until_expiry
            },
            'lemonsqueezy': {
                'subscription_id': self.lemonsqueezy_subscription_id,
                'customer_id': self.lemonsqueezy_customer_id,
                'variant_id': self.lemonsqueezy_variant_id
            },
            'limits': {
                'max_users': self.max_users,
                'max_patients': self.max_patients
            },
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def create(cls, organization_id, plan_name=PLAN_FREE, **kwargs):
        """
        Create a new subscription for an organization.
        
        Args:
            organization_id (int): Organization ID
            plan_name (str): Plan name (free, basic, premium, enterprise)
            **kwargs: Additional subscription attributes
            
        Returns:
            Subscription: Created subscription instance
        """
        # Set default limits based on plan
        limits = cls.get_plan_limits(plan_name)
        
        subscription = cls(
            organization_id=organization_id,
            plan_name=plan_name,
            max_users=kwargs.get('max_users', limits['max_users']),
            max_patients=kwargs.get('max_patients', limits['max_patients']),
            **{k: v for k, v in kwargs.items() if k not in ['max_users', 'max_patients']}
        )
        
        db.session.add(subscription)
        db.session.commit()
        return subscription
    
    def update(self, **kwargs):
        """
        Update subscription attributes.
        
        Args:
            **kwargs: Attributes to update
            
        Returns:
            Subscription: Updated subscription instance
        """
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.updated_at = datetime.utcnow()
        db.session.commit()
        return self
    
    def change_plan(self, new_plan_name, billing_cycle=None):
        """
        Change subscription plan.
        
        Args:
            new_plan_name (str): New plan name
            billing_cycle (str, optional): New billing cycle
            
        Returns:
            Subscription: Updated subscription
        """
        if new_plan_name not in self.PLANS:
            raise ValueError(f"Invalid plan name: {new_plan_name}")
        
        limits = self.get_plan_limits(new_plan_name)
        
        self.plan_name = new_plan_name
        self.max_users = limits['max_users']
        self.max_patients = limits['max_patients']
        
        if billing_cycle:
            self.billing_cycle = billing_cycle
        
        self.updated_at = datetime.utcnow()
        db.session.commit()
        return self
    
    def activate(self, period_start=None, period_end=None):
        """
        Activate subscription.
        
        Args:
            period_start (datetime, optional): Period start date
            period_end (datetime, optional): Period end date
            
        Returns:
            Subscription: Activated subscription
        """
        self.status = self.STATUS_ACTIVE
        self.current_period_start = period_start or datetime.utcnow()
        
        if period_end:
            self.current_period_end = period_end
        
        self.updated_at = datetime.utcnow()
        db.session.commit()
        return self
    
    def cancel(self):
        """
        Cancel subscription.
        
        Returns:
            Subscription: Canceled subscription
        """
        self.status = self.STATUS_CANCELED
        self.canceled_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        db.session.commit()
        return self
    
    def pause(self):
        """
        Pause subscription.
        
        Returns:
            Subscription: Paused subscription
        """
        self.status = self.STATUS_PAUSED
        self.updated_at = datetime.utcnow()
        db.session.commit()
        return self
    
    def mark_past_due(self):
        """
        Mark subscription as past due.
        
        Returns:
            Subscription: Updated subscription
        """
        self.status = self.STATUS_PAST_DUE
        self.updated_at = datetime.utcnow()
        db.session.commit()
        return self
    
    def can_add_user(self):
        """
        Check if organization can add more users.
        
        Returns:
            bool: True if can add, False otherwise
        """
        from models.user import User
        current_users = User.query.filter_by(
            organization_id=self.organization_id,
            is_active=True
        ).count()
        return current_users < self.max_users
    
    def can_add_patient(self):
        """
        Check if organization can add more patients.
        
        Returns:
            bool: True if can add, False otherwise
        """
        # This will be implemented when Patient model is created
        # For now, return True
        return True
    
    @staticmethod
    def get_plan_limits(plan_name):
        """
        Get default limits for a plan.
        
        Args:
            plan_name (str): Plan name
            
        Returns:
            dict: Plan limits
        """
        limits = {
            'free': {'max_users': 1, 'max_patients': 50},
            'basic': {'max_users': 3, 'max_patients': 200},
            'premium': {'max_users': 10, 'max_patients': 1000},
            'enterprise': {'max_users': 999, 'max_patients': 999999}
        }
        return limits.get(plan_name, limits['free'])
    
    @staticmethod
    def find_by_organization(organization_id):
        """
        Find subscription by organization ID.
        
        Args:
            organization_id (int): Organization ID
            
        Returns:
            Subscription: Subscription instance or None
        """
        return Subscription.query.filter_by(organization_id=organization_id).first()
    
    @staticmethod
    def find_by_lemonsqueezy_id(subscription_id):
        """
        Find subscription by LemonSqueezy subscription ID.
        
        Args:
            subscription_id (str): LemonSqueezy subscription ID
            
        Returns:
            Subscription: Subscription instance or None
        """
        return Subscription.query.filter_by(lemonsqueezy_subscription_id=subscription_id).first()
    
    @staticmethod
    def get_active_subscriptions():
        """
        Get all active subscriptions.
        
        Returns:
            list: List of active subscriptions
        """
        return Subscription.query.filter(
            Subscription.status.in_([Subscription.STATUS_TRIAL, Subscription.STATUS_ACTIVE])
        ).all()
    
    @staticmethod
    def get_expiring_soon(days=7):
        """
        Get subscriptions expiring within specified days.
        
        Args:
            days (int): Number of days to look ahead
            
        Returns:
            list: List of subscriptions expiring soon
        """
        from datetime import timedelta
        cutoff_date = datetime.utcnow() + timedelta(days=days)
        
        return Subscription.query.filter(
            Subscription.status == Subscription.STATUS_ACTIVE,
            Subscription.current_period_end <= cutoff_date,
            Subscription.current_period_end >= datetime.utcnow()
        ).all()
