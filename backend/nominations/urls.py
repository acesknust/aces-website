from django.urls import path
from .views import CategoryListView, NominationStatusView, NominationCreateView

app_name = 'nominations'

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('nominations/status/', NominationStatusView.as_view(), name='nomination-status'),
    path('nominations/', NominationCreateView.as_view(), name='nomination-create'),
]
