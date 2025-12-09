from django.urls import path
from apps.analytics import views

urlpatterns = [
    path('search-log/', views.log_search, name='log-search'),
    path('result-click/', views.log_result_click, name='log-result-click'),
    path('popular-searches/', views.popular_searches, name='popular-searches'),
    path('trending-searches/', views.trending_searches, name='trending-searches'),
]
