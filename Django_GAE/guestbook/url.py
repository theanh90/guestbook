# from django.conf.urls.defaults import *
from django.conf.urls import patterns, url
from view import MainView, SignView, GreetingDeleteView, GreetingEditView, DojoView
from api import GreetingListService, GreetingService

urlpatterns = patterns(
	'',
	url(r'^map/$|^$', MainView.as_view(), name='main'),
	url(r'^sign/$', SignView.as_view(), name='sign'),
	url(r'^delete/$', GreetingDeleteView.as_view(), name='delete'),
	url(r'^edit/$', GreetingEditView.as_view(), name='edit'),
	url(
		r'^api/guestbook/(?P<guestbook_name>[a-zA-Z0-9\s\+\_]+)/greeting/$',
		GreetingListService.as_view()),
	url(
		r'^api/guestbook/(?P<guestbook_name>[a-zA-Z0-9\s\+\_]+)/greeting/(?P<id>[\d]+)/$',
		GreetingService.as_view()),
	url(r'^dojo/$', DojoView.as_view(), name='dojo')
)