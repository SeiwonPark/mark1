---
title: "Django Validation, Form vs Serializer"

tags:
    - Django Form
    - Django REST Framework Serializer
    - Validation
---

# Django Validation, Form vs Serializer

## TL;DR
- Both **Django Form()** and **Django REST Framework Serializer** can use `is_valid()` and `validators` when validating data. They look alike, but totally different.
  - [`validators.py` from Django Form](https://github.com/django/django/blob/main/django/core/validators.py)
  - [`validators.py` from Django REST Framework](https://github.com/encode/django-rest-framework/blob/master/rest_framework/validators.py)
  - [`is_valid()` from Django Form](https://github.com/django/django/blob/main/django/forms/formsets.py#L379)
  - [`is_valid()` from Django REST Framework](https://github.com/encode/django-rest-framework/blob/master/rest_framework/serializers.py#L740)

<br/>   

## Which one to use?

I've been currently working on validating and saving models in Django REST Framework. And I've got 2 choices:  `Form` and `Serializer`. And without second thought, I just tried to use `Serializer` but honestly I couldn't think of any proper reasons for that but only guesses. So, comparison was needed to make it clear.

<br/>   

## Django Form - [`validators`](https://docs.djangoproject.com/en/4.1/ref/validators/#module-django.core.validators)

First, you might not need any total model validations but only some attributes' validation or even you might not need it anyway. 

When validating some attributes inside form or model fields, you can use `validators`. [The primary task of a Form object is to validate data](https://docs.djangoproject.com/en/4.1/ref/forms/api/#django.forms.Form.is_valid).

```python
# forms.py

from django.core import validators
from django.forms import CharField

class SlugField(CharField):
    default_validators = [validators.validate_slug] # `validate_slug`: an instance of a RegexValidator
```

And another example of `validators`.

```python
# forms.py

from django import forms

class MyForm(forms.Form):
    even_field = forms.IntegerField(validators=[validate_even]) # `validate_even`: a function that only allows even numbers
```

Simply, when validating some attributes in forms, use `validators`. 

<br/>   

## Django Form - [`is_valid()`](https://docs.djangoproject.com/en/4.1/ref/forms/api/#django.forms.Form.is_valid)

BTW how about the whole form fields' valitation? In that case, you could use `is_valid()` method. 

```python
# temp.py

data = {
    'subject': 'hello',
    'message': 'Hi there',
    'sender': 'foo@example.com',
    'cc_myself': True
}

f = ContactForm(data)
print(f.is_valid()) # True
```

```python
# temp.py

data = {
    'subject': '', # <---------- `subject` attribute is blank
    'message': 'Hi there',
    'sender': 'invalid email address',
    'cc_myself': True
}
f = ContactForm(data)
print(f.is_valid()) # False
```

This looks so convenient!

But **BE CAUTIOUS** if you try to use custom validation. 

Suppose you have following form:

```python
# forms.py

from django import forms
from django.core.validators import validate_email

class MultiEmailField(forms.Field):
    def to_python(self, value):
        """Normalize data to a list of strings."""
        # Return an empty list if no input was given.
        if not value:
            return []
        return value.split(',')

    def validate(self, value):
        """Check if value consists only of valid emails."""
        # Use the parent's handling of required fields, etc.
        super().validate(value)
        for email in value:
            validate_email(email)

class ContactForm(forms.Form):
    subject = forms.CharField(max_length=100)
    message = forms.CharField()
    sender = forms.EmailField()
    recipients = MultiEmailField()  # <--------------- custom validation implemented here
    cc_myself = forms.BooleanField(required=False)
```

When `is_valid()` is called on `ContactForm`, `MultiEmailField().clean()` will be triggered during cleaning process. 
And `MultiEmailField()`'s `to_python()` and `validate()` function would be called.

Also, when implementing validation with some fields without `validators` but with your custom form, [you should implement `clean()` method as well](https://docs.djangoproject.com/en/4.1/ref/forms/api/#django.forms.Form.clean).

<br/>   


## Django REST Framework Serializer

[Validation in Django REST Framework serializers is handled a little differently to how validation works in Django's ModelForm class.](https://www.django-rest-framework.org/api-guide/validators/#validation-in-rest-framework)

Unlike `ModelForm`, REST Framework's validation is **performed entirely on the serializer class**. And plus validations in REST Framework are easy to be switched between `ModelSerailizer` and `Serailizer`. (If you're using `Serializer`, additionally defining validation rules is required.)

<br/>   

## Django REST Framework - [`validators`](https://www.django-rest-framework.org/api-guide/serializers/#validators)

Just like [Django Form](#django-form---validators), you could use `validators`

```python
def multiple_of_ten(value):
    if value % 10 != 0:
        raise serializers.ValidationError('Not a multiple of ten')

class GameRecord(serializers.Serializer):
    score = IntegerField(validators=[multiple_of_ten])
```

And **when deserializing data**, [you always need to call is_valid() before attempting to access the validated data, or save an object instance](https://www.django-rest-framework.org/api-guide/serializers/#validation).


## Django REST Framework - [`is_valid()`](https://www.django-rest-framework.org/api-guide/serializers/#validation)

```python
serializer = CommentSerializer(data={
    'email': 'foobar',
    'content': 'baz'
    # Missing `created` attribute
})

serializer.is_valid()
# False
```

Unlike Form's `is_valid()`, Django REST Framework's `is_valid()` function can take `raise_exception : boolean` parameter. By default, if set `raise_exception=True`, it returns HTTP 400 response.

And of course, you could achieve both [Field-level validation](https://www.django-rest-framework.org/api-guide/serializers/#field-level-validation) and [Object-level validation](https://www.django-rest-framework.org/api-guide/serializers/#object-level-validation).
