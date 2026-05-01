from django.urls import path
from .views import BusinessList, BusinessDetail, MyBusinessList

app_name = 'student_businesses'

urlpatterns = [
    path('', BusinessList.as_view(), name='business_list'),
    path('my-businesses/', MyBusinessList.as_view(), name='my_businesses'),
    path('<slug:slug>/', BusinessDetail.as_view(), name='business_detail'),
]
