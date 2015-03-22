import json
import logging

from django.http import HttpResponse
from django.views.generic.edit import FormView
from django.http import Http404

from model import Greeting, Guestbook
from form import ApiEditForm


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


class GreetingListService(JSONResponseMixin, FormView):

	# GET /api/guestbook/<guestbook_name>/greeting?cursor: Get list greetings API
	def get(self, request, *args, **kwargs):
		greeing_per_page = 5
		guestbook_name = kwargs['guestbook_name']
		cursor = self.request.GET.get('cursor')
		if cursor:
			try:
				data = Greeting.greetings_to_dict(guestbook_name, greeing_per_page, cursor)
			except:
				raise Http404("This URL is wrong!!")
		else:
			data = Greeting.greetings_to_dict(guestbook_name, greeing_per_page)
		context = {}
		if data[0]:
			context = {
				'guestbookname': guestbook_name, 'more': data[2], 'next_cursor': data[1].urlsafe(),
				'greetings': data[0]}

		return self.render_to_response(context)

	# POST /api/guestbook/<guestbook_name>/greeting: Create new greeting API
	form_class = ApiEditForm

	def form_valid(self, form):
		guestbook_name = form.cleaned_data['book_name']
		message = form.cleaned_data['message']
		greeting_data = {'name': guestbook_name, 'content': message}
		if Greeting.put_from_dict(greeting_data):
			return HttpResponse(status=204)
		else:
			return HttpResponse(status=404)

	def form_invalid(self, form):
		return HttpResponse(status=400)


class GreetingService(JSONResponseMixin, FormView):

	# GET /api/guestbook/<guestbook_name>/greeting/<id>: Get greeting API
	def get(self, request, *args, **kwargs):
		guestbook_name = kwargs['guestbook_name']
		id = kwargs['id']
		key = Greeting.get_key(id, guestbook_name)
		greeting = Greeting.get_greeting(key)
		if not greeting:
			raise Http404("Cannot retrieve the Greeting!!")
		context = greeting.to_dict()
		context['guestbook_name'] = guestbook_name

		return self.render_to_response(context)

	# PUT /api/guestbook/<guestbook_name>/greeting/<id>: Edit greeting API
	form_class = ApiEditForm

	def put(self, request, *args, **kwargs):
		form = self.get_form(self.form_class)
		logging.warning(form)
		if form.is_valid():
			guestbook_name = self.kwargs['guestbook_name']
			id = self.kwargs['id']
			message = form.cleaned_data['message']
			key = Greeting.get_key(id, guestbook_name)
			if Greeting.update_message(key, message):
				return HttpResponse(status=204)
			else:
				raise Http404("Failed to edit a Greeting!!")
		else:
			return HttpResponse(status=400)


	# DELETE /api/guestbook/<guestbook_name>/greeting/<id>: Delete greeting API
	def delete(self, request, *args, **kwargs):
		guestbook_name = self.kwargs['guestbook_name']
		id = self.kwargs['id']
		key = Greeting.get_key(id, guestbook_name)
		if Greeting.delete_greeting(key) is None:
			return HttpResponse(status=204)
		else:
			raise Http404("Failed to delete a Greeting!!")
