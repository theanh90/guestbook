# from django.conf.urls.defaults import *
from django.conf.urls import patterns, url
from guestbook.view import MainView, SignView, GreetingDeleteView, GreetingEditView

urlpatterns = patterns(
	'',
	url(r'^map/$|^$', MainView.as_view(), name='main'),
	url(r'^sign/$', SignView.as_view(), name='sign'),
	url(r'^delete/$', GreetingDeleteView.as_view(), name='delete'),
	url(r'^edit/$', GreetingEditView.as_view(), name='edit'),
)