---
title: "Django REST Framework, Viewset vs APIView"

tags:
    - Django REST Framework
    - Viewset
    - APIView
---

# Django REST Framework, Viewset vs APIView

## TL;DR

- **ViewSet** has internally implemented all method handlers. So, overriding each method is needed to modify feature.
- **ViewSet**, **ModelViewSet** typically uses **`Router Class`** not **`as_view()`**.
- With **CustomViewSet**, you could take specific method handlers.
- With **APIView**, you should implement method handlers you need. **APIView** can be used both Funtion-based View and Class-based View.
- Relations between Django REST Framework's **APIView**, **GenericAPIView**, various **Mixins**, and **Viewsets** can be initially complex. [Classy Django REST Framework](https://www.cdrf.co/) provides browsable reference with full methods and attributes.


<br/>   

## 1. Viewset

Viewset is [a type of class-based View, that does not provide any method handlers such as `.get()` or `.post()`, and instead provides actions such as `.list()` and `.create()`](https://www.django-rest-framework.org/api-guide/viewsets/#viewsets).

And [Viewset class inherits from `APIView`](https://www.django-rest-framework.org/api-guide/viewsets/#viewset).

The method handlers are mapped as follows:

```python
# views.py

class MyUserViewSet(viewsets.ViewSet):
    def list(self, request): # REST API `GET`
        pass

    def retrieve(self, request, pk=None): # REST API `GET`
        pass

    def create(self, request): # REST API `POST`
        pass

    def update(self, request, pk=None): # REST API `PUT`
        pass

    def partial_update(self, request, pk=None): # REST API `PATCH`
        pass

    def destroy(self, request, pk=None): # REST API `DELETE`
        pass
```

<br/>   

### 1.1 ModelViewSet

But just like `Serializer` and `ModelSerializer`, you could use more convenient way of Viewset, `viewsets.ModelViewset`, [which inherits from GenericAPIView](https://www.django-rest-framework.org/api-guide/viewsets/#modelviewset).

```python
# views.py

from rest_framework.permissions import AllowAny

class UserViewSet(viewsets.ModelViewSet):
    """
    A viewset for viewing and editing user instances.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] 
```

[The method handlers for a ViewSet are only bound to the corresponding actions at the point of finalizing the view, using the `.as_view()` method](https://www.django-rest-framework.org/api-guide/viewsets/#viewsets).

But usually these **Viewsets are registered with another Router Classes** not with urlconf.

So, it would be as follows:

```python
# urls.py

from myapp.views import MyUserViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users', MyUserViewSet, basename='user')
urlpatterns = router.urls
```

<br/>   

### 1.2 CustomViewSet

[You may need to provide custom ViewSet classes that do not have the full set of ModelViewSet actions, or that customize the behavior in some other way](https://www.django-rest-framework.org/api-guide/viewsets/#custom-viewset-base-classes).

In that case, you can just inherit `mixins` as you want. Following example of ViewSet only provides `retrieve`, `create`, and `list` actions. 

```python
from rest_framework import mixins

class CreateListRetrieveViewSet(mixins.CreateModelMixin,
                                mixins.ListModelMixin,
                                mixins.RetrieveModelMixin,
                                viewsets.GenericViewSet):
    """
    A viewset that provides `retrieve`, `create`, and `list` actions.

    To use it, override the class and set the `.queryset` and
    `.serializer_class` attributes.
    """
    pass
```


<br/>   


## 2. APIView

APIView is a **subclass of Django View** and they are different in the following ways:

|Django View|Django REST Framework APIView|
|:---------:|:---------------------------:|
|[HttpRequest](https://github.com/django/django/blob/main/django/http/request.py#L47)|[Request](https://github.com/encode/django-rest-framework/blob/master/rest_framework/request.py#L140)|
|[HttpResponse](https://github.com/django/django/blob/main/django/http/response.py#L361)|[Response](https://github.com/encode/django-rest-framework/blob/master/rest_framework/response.py#L14)|
|[exceptions](https://github.com/django/django/blob/main/django/core/exceptions.py)|[APIException](https://github.com/encode/django-rest-framework/blob/master/rest_framework/exceptions.py#L99)|

Plus, authentication and appropriate permission and/or throttle checks will be run before dispatching the request to the handler method.

There are 2 ways you can implement **APIView**.

<br/>   

### 2.1 With Function-based View(`@api_view`)

The most simplest form is:

```python
# views.py

from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response

@api_view(["GET"])
def foo(request: Request) -> Response:
    return Response({success: True})
```

<br/>   


### 2.2 With Class-based View(`APIView`)

The most simplest form is:

```python
# views.py

from rest_framework import authentication, permissions
from rest_framework.views import APIView
from rest_framework.request import Request
from rest_framework.response import Response

class EmailValidationView(APIView):
    authentication_classes = [authentication.TokenAuthentication]
    permission_classes = [permissions.IsAdminUser]

    def get(self, request: Request) -> Response: # needs to specify `method type` as function name
        return Response({success: True})

    def post(self, request: Request) -> Response: # needs to specify `method type` as function name
        email = request.data["email"]
        return Response(email)
```

