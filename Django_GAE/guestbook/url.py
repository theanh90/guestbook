# from django.conf.urls.defaults import *
from django.conf.urls import patterns, url
from guestbook.view import MainView, SignView

urlpatterns = patterns('',
    # (r'^sign/$', sign_post),
    # (r'^$', main_page),
    url(r'^map/$|^$', MainView.as_view(), name='main'),
    url(r'^sign/$', SignView.as_view(), name='sign'),
)