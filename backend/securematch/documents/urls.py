from django.urls import path
from .views import UploadDocumentView, InternalSearchView

urlpatterns = [
    path("upload/", UploadDocumentView.as_view()),
    path("search/internal/", InternalSearchView.as_view()),
]