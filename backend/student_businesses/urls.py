from django.urls import path
from .views import (
    BusinessList, BusinessDetail, MyBusinessList,
    ProductListCreate, ProductDetail, ProductImageDelete,
    GlobalProductList
)

app_name = 'student_businesses'

urlpatterns = [
    # Business
    path('', BusinessList.as_view(), name='business_list'),
    path('my-businesses/', MyBusinessList.as_view(), name='my_businesses'),
    path('<slug:slug>/', BusinessDetail.as_view(), name='business_detail'),

    # Products
    path('products/', ProductListCreate.as_view(), name='product_list_create'),
    path('products/global/', GlobalProductList.as_view(), name='global_product_list'),
    path('products/<int:pk>/', ProductDetail.as_view(), name='product_detail'),

    # Gallery image management
    path('product-images/<int:pk>/', ProductImageDelete.as_view(), name='product_image_delete'),
]
