from django.urls import path
from .views import (
    UploadDocumentView,
    InternalSearchView,
    ExternalSearchView,
    RotateAuditorKeyView,
    AuditorLogsView
)

urlpatterns = [
    path("upload/", UploadDocumentView.as_view()),
    path("search/internal/", InternalSearchView.as_view()),
    path("search/external/", ExternalSearchView.as_view()),
    path("auditor/rotate-key/", RotateAuditorKeyView.as_view()),
    path("auditor/<int:auditor_id>/logs/", AuditorLogsView.as_view()),
]