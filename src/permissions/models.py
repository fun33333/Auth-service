"""
Permissions models for service access control.

Controls:
- Which employees can access which services (SIS/HDMS/Future)
- HDMS-specific role assignments (Moderator/Assignee/Requestor)
- SIS uses designation as role automatically
"""
import uuid
from django.db import models
from django.core.exceptions import ValidationError
from employees.models import Employee
from employees.utils import SoftDeleteModel


class ServiceAccess(SoftDeleteModel):
    """
    Tracks which employees have access to which services.
    
    Flow:
    1. Employee created → No service access by default
    2. Admin grants SIS access → Employee can login to SIS with designation-based role
    3. Admin grants HDMS access → Must also assign HdmsRole
    
    Example:
    - Ahmed (Teacher) → SIS Access ✓ → Logs in as Teacher (from designation)
    - Ahmed (Teacher) → HDMS Access ✓ + Moderator role → Logs in as Moderator
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='service_accesses',
        help_text="Employee who has access"
    )
    
    SERVICE_CHOICES = [
        ('sis', 'School Information System (SIS)'),
        ('hdms', 'Help Desk Management System (HDMS)'),
        ('finance', 'Finance Management (Future)'),
        ('hr', 'HR Management (Future)'),
        ('procurement', 'Procurement (Future)'),
    ]
    service = models.CharField(
        max_length=20,
        choices=SERVICE_CHOICES,
        help_text="Which service this access is for"
    )
    
    is_active = models.BooleanField(
        default=True,
        help_text="Can employee currently access this service?"
    )
    
    granted_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When access was granted"
    )
    
    granted_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='granted_accesses',
        help_text="Admin who granted this access"
    )
    
    revoked_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When access was revoked (if applicable)"
    )
    
    revoked_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='revoked_accesses',
        help_text="Admin who revoked this access"
    )
    
    notes = models.TextField(
        blank=True,
        null=True,
        help_text="Admin notes about this access grant"
    )
    
    class Meta:
        verbose_name = "Service Access"
        verbose_name_plural = "Service Accesses"
        db_table = "permissions_service_access"
        unique_together = [['employee', 'service']]  # One access per service per employee
        indexes = [
            models.Index(fields=['employee', 'service', 'is_active']),
            models.Index(fields=['service', 'is_active']),
        ]
    
    def __str__(self):
        status = "Active" if self.is_active else "Inactive"
        return f"{self.employee.full_name} → {self.get_service_display()} ({status})"
    
    def revoke(self, revoked_by_employee):
        """Revoke this service access"""
        from django.utils import timezone
        self.is_active = False
        self.revoked_at = timezone.now()
        self.revoked_by = revoked_by_employee
        self.save()
    
    def reactivate(self):
        """Reactivate this service access"""
        self.is_active = True
        self.revoked_at = None
        self.revoked_by = None
        self.save()


class HdmsRole(SoftDeleteModel):
    """
    HDMS-specific role assignments.
    
    Only for HDMS service! SIS uses designation as role.
    
    Roles:
    - Admin: Full system access, can manage users and all settings
    - Moderator: Can manage tickets, assign to others, close tickets
    - Assignee: Can be assigned tickets, update status, add notes
    - Requestor: Can only create tickets and view own tickets
    
    Example:
    - Admin with HDMS access → Full system control
    - Teacher with HDMS access → Could be Moderator (manages student tech issues)
    - IT Staff with HDMS access → Could be Assignee (fixes issues)
    - Any employee with HDMS access → Could be Requestor (reports issues)
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    service_access = models.OneToOneField(
        ServiceAccess,
        on_delete=models.CASCADE,
        related_name='hdms_role',
        help_text="HDMS service access this role is for"
    )
    
    ROLE_CHOICES = [
        ('admin', 'Administrator (Full system access)'),
        ('moderator', 'Moderator (Full ticket management)'),
        ('assignee', 'Assignee (Can be assigned tickets)'),
        ('requestor', 'Requestor (Can only create tickets)'),
    ]
    role_type = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        help_text="HDMS role type"
    )
    
    can_view_all_tickets = models.BooleanField(
        default=False,
        help_text="Can view all tickets (moderator privilege)"
    )
    
    can_assign_tickets = models.BooleanField(
        default=False,
        help_text="Can assign tickets to others (moderator privilege)"
    )
    
    can_close_tickets = models.BooleanField(
        default=False,
        help_text="Can close/resolve tickets (moderator privilege)"
    )
    
    can_manage_users = models.BooleanField(
        default=False,
        help_text="Can manage HDMS users and permissions (admin privilege)"
    )
    
    assigned_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When role was assigned"
    )
    
    assigned_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_hdms_roles',
        help_text="Admin who assigned this role"
    )
    
    class Meta:
        verbose_name = "HDMS Role"
        verbose_name_plural = "HDMS Roles"
        db_table = "permissions_hdms_role"
    
    def __str__(self):
        return f"{self.service_access.employee.full_name} → HDMS {self.get_role_type_display()}"
    
    def clean(self):
        """Validate that service_access is for HDMS"""
        if self.service_access and self.service_access.service != 'hdms':
            raise ValidationError(
                'HdmsRole can only be assigned to HDMS service access.'
            )
    
    def save(self, *args, **kwargs):
        """Auto-set permissions based on role_type"""
        self.full_clean()
        
        # Set permissions based on role
        if self.role_type == 'admin':
            self.can_view_all_tickets = True
            self.can_assign_tickets = True
            self.can_close_tickets = True
            self.can_manage_users = True
        elif self.role_type == 'moderator':
            self.can_view_all_tickets = True
            self.can_assign_tickets = True
            self.can_close_tickets = True
            self.can_manage_users = False
        elif self.role_type == 'assignee':
            self.can_view_all_tickets = False
            self.can_assign_tickets = False
            self.can_close_tickets = True  # Can close tickets assigned to them
            self.can_manage_users = False
        elif self.role_type == 'requestor':
            self.can_view_all_tickets = False
            self.can_assign_tickets = False
            self.can_close_tickets = False
            self.can_manage_users = False
        
        super().save(*args, **kwargs)


class PermissionAudit(models.Model):
    """
    Audit log for permission changes.
    
    Tracks:
    - Who granted/revoked access
    - When changes were made
    - What changed
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='permission_audits',
        help_text="Employee whose permissions changed"
    )
    
    ACTION_CHOICES = [
        ('grant_access', 'Access Granted'),
        ('revoke_access', 'Access Revoked'),
        ('assign_role', 'Role Assigned'),
        ('change_role', 'Role Changed'),
        ('remove_role', 'Role Removed'),
    ]
    action = models.CharField(
        max_length=20,
        choices=ACTION_CHOICES,
        help_text="What action was performed"
    )
    
    service = models.CharField(
        max_length=20,
        help_text="Which service (SIS/HDMS)"
    )
    
    details = models.JSONField(
        default=dict,
        help_text="Additional details about the change"
    )
    
    performed_by = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        related_name='performed_permission_changes',
        help_text="Admin who performed this action"
    )
    
    performed_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When action was performed"
    )
    
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        help_text="IP address of admin"
    )
    
    class Meta:
        verbose_name = "Permission Audit"
        verbose_name_plural = "Permission Audits"
        db_table = "permissions_audit"
        ordering = ['-performed_at']
        indexes = [
            models.Index(fields=['employee', '-performed_at']),
            models.Index(fields=['service', '-performed_at']),
            models.Index(fields=['performed_by', '-performed_at']),
        ]
    
    def __str__(self):
        return f"{self.employee.full_name} - {self.get_action_display()} ({self.service})"
