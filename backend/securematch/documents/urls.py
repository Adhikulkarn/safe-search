from django.urls import path
from .views import ExternalSearchView, UploadDocumentView, InternalSearchView

urlpatterns = [
    path("upload/", UploadDocumentView.as_view()),
    path("search/internal/", InternalSearchView.as_view()),
    path("search/external/", ExternalSearchView.as_view()),
]