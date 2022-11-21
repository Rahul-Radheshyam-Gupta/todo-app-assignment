from django.db import models

# Create your models here.
PENDING = 'Pending'
APPROVED = 'Approved'
status_choices = (
    (PENDING, 'Pending'),
    (APPROVED, 'Approved'),
)


class Task(models.Model):
    """
    This model stores todo task.
    """
    name = models.CharField(max_length=1000, blank=True)
    status = models.CharField(max_length=20, choices=status_choices, default=PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name