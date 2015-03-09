import json
import logging

from django.http import HttpResponse
from django.views.generic.edit import FormView
from django import forms
from django.http import Http404
from google.appengine.ext import ndb

from model import Greeting, Guestbook


class JSONResponseMixin(object):
	"""
	A mixin that can be used to render a JSON response.
	"""
	def render_to_response(self, context, **response_kwargs):
		"""
		Returns a JSON response, transforming 'context' to make the payload.
		"""
		return HttpResponse(
			self.dic_to_json(context), content_type='application/json', **response_kwargs
		)

	def dic_to_json(self, context):
		"""
		Returns an object that will be serialized as JSON by json.dumps().
		"""
		return json.dumps(context)


class EditForm(forms.Form):
	message = forms.CharField(label='Message', max_length=10, required=True)
	book_name = forms.CharField(widget=forms.HiddenInput)


class GreetingListService(JSONResponseMixin, FormView):

	def get(self, request, *args, **kwargs):
		greeing_per_page = 2
		guesbook_name = kwargs['guestbook_name']
		cursor = self.request.GET.get('cursor')
		if cursor:
			try:
				data = Greeting.greetings_to_dic(guesbook_name, greeing_per_page, cursor)
			except:
				raise Http404("This cursor is wrong!!")
		else:
			data = Greeting.greetings_to_dic(guesbook_name, greeing_per_page)
		context = {
			'guesbookname': guesbook_name, 'more': data[2], 'next_cursor': data[1].urlsafe(),
			'greetings': data[0]}

		return self.render_to_response(context)

	form_class = EditForm

	def form_valid(self, form):
		guestbook_name = form.cleaned_data['book_name']
		message = form.cleaned_data['message']
		greeting_data = {'name': guestbook_name, 'content': message}
		if Greeting.put_from_dict(greeting_data):
			HttpResponse(status=204)
		else:
			Http404("Failed to add a Greeting!!")

	def form_invalid(self, form):
		return HttpResponse(status=400)


class GreetingService(JSONResponseMixin, FormView):

	def get(self, request, *args, **kwargs):
		guesbook_name = kwargs['guestbook_name']
		id = kwargs['id']
		greeting = ndb.Key(Guestbook, guesbook_name, Greeting, int(id)).get()
		if not greeting:
			raise Http404("Cannot retrieve the Greeting!!")
		context = greeting.entity_to_dic()
		context['id'] = id
		context['guestbook_name'] = guesbook_name

		return self.render_to_response(context)

	form_class = EditForm

	# def get_initial(self):
	# 	guestbook_name = self.request.GET.get('guestbook_name')
	# 	key = self.request.GET.get('key')
	# 	if key:
	# 		greeting = Greeting.get_greeting(key)
	# 		initial = super(GreetingService, self).get_initial()
	# 		initial['message'] = greeting.content
	# 		initial['book_name'] = guestbook_name
	# 		initial['key'] = key
	# 		return initial

	def form_valid(self, form):
		guestbook_name = self.kwargs['guestbook_name']
		id = self.kwargs['id']
		message = form.cleaned_data['message']
		key = ndb.Key(Guestbook, guestbook_name, Greeting, int(id))
		if Greeting.update_message(key, message):
			HttpResponse(status=204)
		else:
			Http404("Failed to edit a Greeting!!")

	def form_invalid(self, form):
		return HttpResponse(status=400)

	def delete(self, request, *args, **kwargs):
		guestbook_name = self.kwargs['guestbook_name']
		id = self.kwargs['id']
		key = ndb.Key(Guestbook, guestbook_name, Greeting, int(id))
		if Greeting.delete_greeting(key):
			HttpResponse(status=204)
		else:
			Http404("Failed to delete a Greeting!!")
