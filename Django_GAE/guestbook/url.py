# from django.conf.urls.defaults import *
from django.conf.urls import patterns, url
from guestbook.view import MainView, SignView

urlpatterns = patterns(
	'',
	url(r'^map/$|^$', MainView.as_view(), name='main'),
	url(r'^sign/$', SignView.as_view(), name='sign'),
)