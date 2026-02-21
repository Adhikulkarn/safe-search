from django.db import models


class EncryptedDocument(models.Model):
    encrypted_blob = models.JSONField()  # contains nonce + ciphertext
    created_at = models.DateTimeField(auto_now_add=True)


class SearchTokenIndex(models.Model):
    token = models.CharField(max_length=64, db_index=True)
    external_token = models.CharField(
        max_length=64,
        null=True,
        blank=True,
        db_index=True
    )
    document = models.ForeignKey(
        EncryptedDocument,
        on_delete=models.CASCADE,
        related_name="tokens"
    )

    class Meta:
        indexes = [
            models.Index(fields=["token"]),
        ]

class Auditor(models.Model):
    name = models.CharField(max_length=255)
    public_key = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ExternalSearchAudit(models.Model):
    auditor = models.ForeignKey(
        "Auditor",
        on_delete=models.CASCADE,
        related_name="external_search_logs"
    )

    keyword_hash = models.CharField(max_length=64)

    total_matches = models.IntegerField(default=0)
    returned_count = models.IntegerField(default=0)
    truncated = models.BooleanField(default=False)

    execution_time_ms = models.FloatField()

    # 🔐 Security tracking
    success = models.BooleanField(default=True)
    failure_reason = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    # 🌍 Optional metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["auditor"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["success"]),
        ]

    def __str__(self):
        status = "SUCCESS" if self.success else "FAILED"
        return f"[{status}] Auditor {self.auditor.id} - {self.created_at}"