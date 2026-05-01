from django.urls import path
from .views import BusinessList, BusinessDetail, MyBusinessList, ProductListCreate, ProductDetail, GlobalProductList

app_name = 'student_businesses'

urlpatterns = [
    path('', BusinessList.as_view(), name='business_list'),
    path('my-businesses/', MyBusinessList.as_view(), name='my_businesses'),
    path('products/', ProductListCreate.as_view(), name='product_list_create'),
    path('products/global/', GlobalProductList.as_view(), name='global_product_list'),
    path('products/<int:pk>/', ProductDetail.as_view(), name='product_detail'),
    path('<slug:slug>/', BusinessDetail.as_view(), name='business_detail'),
]
