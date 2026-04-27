# Django REST Framework Example (Simplified)
# In a full project, this would involve settings.py, urls.py, and models.py

"""
To run this in a Django environment:
1. Create a Django project: django-admin startproject myproject
2. Add a view for the REST API:
"""

from django.http import JsonResponse
from django.views import View

class MenuApiView(View):
    def get(self, request):
        return JsonResponse({
            "framework": "Django",
            "items": [
                {"name": "Sample Dish", "price": 10.99}
            ]
        })

# urls.py configuration:
# path('api/menu/', MenuApiView.as_view()),
