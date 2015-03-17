from google.appengine.api import users
import urllib

from django.views.generic.base import TemplateView
from django.views.generic.edit import FormView
from django.views.generic import View
from django.http import HttpResponseRedirect

from model import Greeting, DEFAULT_GUESTBOOK_NAME
from form import SignForm, EditForm


class MainView(TemplateView):

	template_name = 'guestbook/main_page.html'

	def get_context_data(self, **kwargs):
		guestbook_name = self.request.GET.get("guestbook_name", DEFAULT_GUESTBOOK_NAME)
		greetings = Greeting.get_list(guestbook_name, 10)

		current_user = users.get_current_user()
		if current_user:
			url = users.create_logout_url(self.request.get_full_path())
			url_linktext = 'Logout'
		else:
			url = users.create_login_url(self.request.get_full_path())
			url_linktext = 'Login'

		context = super(MainView, self).get_context_data(**kwargs)
		context['admin'] = users.is_current_user_admin()
		context['current_user'] = current_user
		context['greetings'] = greetings
		context['guestbook_name'] = guestbook_name
		context['url'] = url
		context['url_linktext'] = url_linktext
		return context


class SignView(FormView):

	template_name = 'guestbook/sign.html'
	form_class = SignForm

	def get_cleaned_data(self, form):
		guestbook_name = form.cleaned_data['book_name']
		content = form.cleaned_data['greeting_message']
		data = {'name': guestbook_name, 'content': content}
		return data

	def get_initial(self):
		guestbook_name = self.request.GET.get('guestbook_name', DEFAULT_GUESTBOOK_NAME)
		initial = super(SignView, self).get_initial()
		initial['book_name'] = guestbook_name
		initial['author'] = guestbook_name
		return initial

	def form_valid(self, form):
		guestbook_name = form.cleaned_data['book_name']
		guestbook_content = form.cleaned_data['greeting_message']
		greeting_data = {'name': guestbook_name, 'content': guestbook_content}
		Greeting.put_from_dict(greeting_data)

		self.success_url = ('/map/?' + urllib.urlencode({'guestbook_name': guestbook_name}))
		return super(SignView, self).form_valid(form)


class GreetingEditView(FormView):

	template_name = 'guestbook/edit.html'
	form_class = EditForm

	def get_initial(self):
		guestbook_name = self.request.GET.get('guestbook_name', DEFAULT_GUESTBOOK_NAME)
		key = self.request.GET.get('key')
		initial = super(GreetingEditView, self).get_initial()
		if key:
			greeting = Greeting.get_greeting(key)
			initial['message'] = greeting.content
			initial['book_name'] = guestbook_name
			initial['key'] = key
		return initial

	def form_valid(self, form):
		guestbook_name = form.cleaned_data['book_name']
		message = form.cleaned_data['message']
		key = form.cleaned_data['key']
		Greeting.update_message(key, message)

		self.success_url = ('/map/?' + urllib.urlencode({'guestbook_name': guestbook_name}))
		return super(GreetingEditView, self).form_valid(form)


class GreetingDeleteView(View):
	def get(self, request, *args, **kwargs):
		key = self.request.GET.get('key')
		guestbook_name = self.request.GET.get('guestbook_name')
		Greeting.delete_greeting(key)

		return HttpResponseRedirect('/?' + urllib.urlencode({'guestbook_name': guestbook_name}))