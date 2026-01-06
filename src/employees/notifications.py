from django.core.mail import send_mail
from django.conf import settings
from django.contrib import messages
from audit.middleware import get_current_user

def send_employee_code_notification(employee, old_code, new_code):
    """
    Sends an email to the employee and adds a flash message for the admin.
    """
    if old_code == new_code:
        return

    subject = f"Your Employee Code has been updated - IAK"
    message = f"""
    Dear {employee.full_name},

    Your official employee code has been updated in our system.

    Old Code: {old_code}
    New Code: {new_code}

    Please use your new employee code for all future communications and logins.

    Best regards,
    IAK Human Resources Team
    """
    
    recipient_list = []
    if employee.org_email:
        recipient_list.append(employee.org_email)
    if employee.personal_email:
        recipient_list.append(employee.personal_email)

    if recipient_list:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=True,
        )

def notify_admin_of_code_change(request, old_code, new_code):
    """
    Helper to add a success message to the Django admin panel.
    """
    if old_code != new_code:
        messages.success(
            request, 
            f"Employee code changed successfully! Old: {old_code} -> New: {new_code}"
        )
