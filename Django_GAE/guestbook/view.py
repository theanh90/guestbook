from django.views.generic.base import TemplateView
from django import forms
from django.views.generic.edit import FormView

from google.appengine.api import users

from guestbook.model import Greeting, Author, DEFAULT_GUESTBOOK_NAME

import urllib


class MainView(TemplateView):

    template_name = 'guestbook/main_page.html'

    def get_context_data(self, **kwargs):

        guestbook_name = self.request.GET.get("guestbook_name", DEFAULT_GUESTBOOK_NAME)

        greetings = Greeting().get_list(guestbook_name, 10)

        current_user = users.get_current_user()
        if current_user:
            url = users.create_logout_url(self.request.get_full_path())
            url_linktext = 'Logout'
        else:
            url = users.create_login_url(self.request.get_full_path())
            url_linktext = 'Login'

        context = super(MainView, self).get_context_data(**kwargs)
        context['current_user'] = current_user
        context['greetings'] = greetings
        context['guestbook_name'] = guestbook_name
        context['url'] = url
        context['url_linktext'] = url_linktext
        return context

class SignForm(forms.Form):
    greeting_message = forms.CharField(label= 'Greeting message', widget=forms.Textarea, required=True, max_length=100 )
    book_name = forms.CharField(label='Guestbook name', max_length=10, required=True)

class SignView(FormView):

    def getCleaned_data(self, form):
        guestbook_name = form.cleaned_data['book_name']
        content = form.cleaned_data['greeting_message']
        data =  {'name' : guestbook_name, 'content' : content }
        return data

    template_name = 'guestbook/sign.html'
    form_class = SignForm

    def get_success_url(self):
        guestbook_name = self.request.POST.get('book_name', DEFAULT_GUESTBOOK_NAME)
        return ('/map/?' + urllib.urlencode({'guestbook_name': guestbook_name}))

    def get_initial(self):
        guestbook_name = self.request.GET.get('guestbook_name', DEFAULT_GUESTBOOK_NAME)
        initial = super(SignView, self).get_initial()
        initial['book_name'] = guestbook_name
        return initial

    def form_valid(self, form):
        guestbook_name = self.getCleaned_data(form)['name']
        greeting = Greeting(parent=Greeting().guestbook_key(guestbook_name))
        if users.get_current_user():
            greeting.author = Author(
                    identity=users.get_current_user().user_id(),
                    email=users.get_current_user().email())

        greeting.content = self.getCleaned_data(form)['content']
        greeting.put()
        return super(SignView, self).form_valid(form)

