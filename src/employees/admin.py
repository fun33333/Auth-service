"""
Django Admin configuration for Employees app.

Registers all models with auto-generation, soft delete support, and filters.
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import Department, Designation, Employee, AcademicInstitutionInformation


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    """Admin panel for Department with auto-generated department_id"""
    list_display = ['department_id', 'dept_code', 'dept_name', 'dept_sector', 'is_deleted_badge', 'created_at']
    list_filter = ['dept_sector', 'is_deleted', 'created_at']
    search_fields = ['department_id', 'dept_code', 'dept_name']
    readonly_fields = ['department_id', 'created_at', 'updated_at', 'deleted_at', 'deleted_by']
    
    fieldsets = (
        ('Auto-Generated ID', {
            'fields': ('department_id',),
            'description': 'Department ID is auto-generated (IAK-D-001, IAK-D-002...)'
        }),
        ('Department Information', {
            'fields': ('dept_code', 'dept_name', 'dept_sector', 'description')
        }),
        ('Soft Delete', {
            'fields': ('is_deleted', 'deleted_at', 'deleted_by', 'deletion_reason'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['restore_items']
    
    def is_deleted_badge(self, obj):
        if obj.is_deleted:
            return format_html('<span style="color: red; font-weight: bold;">🗑️ DELETED</span>')
        return format_html('<span style="color: green; font-weight: bold;">✓ Active</span>')
    is_deleted_badge.short_description = 'Status'
    
    def restore_items(self, request, queryset):
        count = 0
        for obj in queryset:
            if obj.is_deleted:
                obj.restore()
                count += 1
        self.message_user(request, f'{count} department(s) restored.')
    restore_items.short_description = 'Restore selected'
    
    def get_queryset(self, request):
        return Department.all_objects.all()


@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    """Admin panel for Designation - Department Specific!"""
    list_display = ['department', 'position_code', 'position_name', 'is_deleted_badge', 'created_at']
    list_filter = ['department', 'is_deleted', 'created_at']
    search_fields = ['position_code', 'position_name', 'department__dept_name']
    readonly_fields = ['created_at', 'updated_at', 'deleted_at', 'deleted_by']
    
    fieldsets = (
        ('Designation Information', {
            'fields': ('department', 'position_code', 'position_name', 'description'),
            'description': 'Designation MUST belong to a department'
        }),
        ('Soft Delete', {
            'fields': ('is_deleted', 'deleted_at', 'deleted_by', 'deletion_reason'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['restore_items']
    
    def is_deleted_badge(self, obj):
        if obj.is_deleted:
            return format_html('<span style="color: red; font-weight: bold;">🗑️ DELETED</span>')
        return format_html('<span style="color: green; font-weight: bold;">✓ Active</span>')
    is_deleted_badge.short_description = 'Status'
    
    def restore_items(self, request, queryset):
        count = 0
        for obj in queryset:
            if obj.is_deleted:
                obj.restore()
                count += 1
        self.message_user(request, f'{count} designation(s) restored.')
    restore_items.short_description = 'Restore selected'
    
    def get_queryset(self, request):
        return Designation.all_objects.all()


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    """Admin panel for Employee with auto-generated IDs"""
    list_display = ['employee_id', 'employee_code', 'full_name', 'department', 'designation', 
                    'employment_type', 'is_active_badge', 'is_superadmin', 'is_deleted_badge', 'created_at']
    list_filter = ['is_active', 'is_superadmin', 'is_deleted', 'gender', 'employment_type',
                   'department', 'designation', 'created_at']
    search_fields = ['employee_id', 'employee_code', 'full_name', 'cnic', 'phone', 'email']
    readonly_fields = ['id', 'employee_id', 'employee_code', 'created_at', 'updated_at', 'deleted_at', 'deleted_by']
    
    fieldsets = (
        ('Auto-Generated Identifiers', {
            'fields': ('employee_id', 'employee_code'),
            'description': 'Both IDs are AUTO-GENERATED'
        }),
        ('Personal Information', {
            'fields': ('full_name', 'cnic', 'dob', 'gender', 'nationality', 'religion')
        }),
        ('Contact Information', {
            'fields': ('email', 'phone', 'emergency_contact_phone', 'organization_phone')
        }),
        ('Address Information', {
            'fields': ('residential_address', 'permanent_address', 'city', 'state')
        }),
        ('Employment Details', {
            'fields': ('department', 'designation', 'joining_date', 'employment_type')
        }),
        ('Bank Information', {
            'fields': ('bank_name', 'account_number'),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('education_history', 'work_experience', 'resume'),
            'classes': ('collapse',),
            'description': 'Education and experience stored as JSON, resume as file'
        }),
        ('Status', {
            'fields': ('is_active', 'is_superadmin')
        }),
        ('Soft Delete', {
            'fields': ('is_deleted', 'deleted_at', 'deleted_by', 'deletion_reason'),
            'classes': ('collapse',)
        }),
        ('System Info', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activate_employees', 'deactivate_employees', 'restore_items']
    
    def is_active_badge(self, obj):
        if obj.is_active:
            return format_html('<span style="color: green; font-weight: bold;">✓ Active</span>')
        return format_html('<span style="color: orange; font-weight: bold;">⚠ Inactive</span>')
    is_active_badge.short_description = 'Active'
    
    def is_deleted_badge(self, obj):
        if obj.is_deleted:
            return format_html('<span style="color: red; font-weight: bold;">🗑️ DELETED</span>')
        return format_html('<span style="color: green; font-weight: bold;">✓ Not Deleted</span>')
    is_deleted_badge.short_description = 'Deletion'
    
    def activate_employees(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count} employee(s) activated.')
    activate_employees.short_description = 'Activate selected'
    
    def deactivate_employees(self, request, queryset):
        count = queryset.update(is_active=False)
        self.message_user(request, f'{count} employee(s) deactivated.')
    deactivate_employees.short_description = 'Deactivate selected'
    
    def restore_items(self, request, queryset):
        count = 0
        for obj in queryset:
            if obj.is_deleted:
                obj.restore()
                count += 1
        self.message_user(request, f'{count} employee(s) restored.')
    restore_items.short_description = 'Restore selected'
    
    def get_queryset(self, request):
        return Employee.all_objects.all()
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Filter designations by selected department"""
        if db_field.name == "designation":
            # Get department from request (if editing existing employee)
            try:
                employee_id = request.resolver_match.kwargs.get('object_id')
                if employee_id:
                    employee = Employee.all_objects.get(pk=employee_id)
                    kwargs["queryset"] = Designation.objects.filter(department=employee.department)
                else:
                    # For new employee, show all designations
                    # User must select department first, then designation field will update via JS
                    kwargs["queryset"] = Designation.objects.all()
            except:
                kwargs["queryset"] = Designation.objects.all()
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


@admin.register(AcademicInstitutionInformation)
class AcademicInstitutionInformationAdmin(admin.ModelAdmin):
    """Admin panel for Academic Institution - Academic sector only"""
    list_display = ['department', 'principal_name', 'contact_number', 'student_capacity', 
                    'established_year', 'is_deleted_badge', 'created_at']
    list_filter = ['is_deleted', 'created_at']
    search_fields = ['department__dept_name', 'principal_name', 'contact_number']
    readonly_fields = ['created_at', 'updated_at', 'deleted_at', 'deleted_by']
    
    fieldsets = (
        ('Academic Institution Details', {
            'fields': ('department', 'address', 'principal_name', 'contact_number', 
                      'student_capacity', 'established_year'),
            'description': 'Only Academic sector departments'
        }),
        ('Soft Delete', {
            'fields': ('is_deleted', 'deleted_at', 'deleted_by', 'deletion_reason'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['restore_items']
    
    def is_deleted_badge(self, obj):
        if obj.is_deleted:
            return format_html('<span style="color: red; font-weight: bold;">🗑️ DELETED</span>')
        return format_html('<span style="color: green; font-weight: bold;">✓ Active</span>')
    is_deleted_badge.short_description = 'Status'
    
    def restore_items(self, request, queryset):
        count = 0
        for obj in queryset:
            if obj.is_deleted:
                obj.restore()
                count += 1
        self.message_user(request, f'{count} academic info(s) restored.')
    restore_items.short_description = 'Restore selected'
    
    def get_queryset(self, request):
        return AcademicInstitutionInformation.all_objects.all()
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """Only show Academic sector departments"""
        if db_field.name == "department":
            kwargs["queryset"] = Department.objects.filter(dept_sector='academic')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
