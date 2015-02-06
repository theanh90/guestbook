from django.views.generic.base import TemplateView
from django.http import HttpResponseRedirect
from django import forms
from django.views.generic.edit import FormView

from google.appengine.api import users
from google.appengine.api import memcache

from guestbook.model import Greeting, Author, guestbook_key, DEFAULT_GUESTBOOK_NAME

import urllib
import logging


class MainView(TemplateView):

    template_name = 'guestbook/main_page.html'

    def get_context_data(self, **kwargs):

        guestbook_name = self.request.GET.get("guestbook_name", DEFAULT_GUESTBOOK_NAME)

        #Use Ggoogle Api Memcache for caching query result.
        greetings = memcache.get('%s:greetings' % guestbook_name)
        if greetings is not None:
            return greetings
        else: #query from Datastore
            greetings_query = Greeting.query(
                ancestor=guestbook_key(guestbook_name)).order(-Greeting.date)
            greetings = greetings_query.fetch(10)
            #add greeting to memcache
            if greetings:
                if not memcache.add(guestbook_name, greetings, 10):
                    logging.error('Memcache set failed.')

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

    template_name = 'guestbook/sign.html'
    form_class = SignForm

    def get_initial(self):
        guestbook_name = self.request.GET.get('guestbook_name', DEFAULT_GUESTBOOK_NAME)
        initial = super(SignView, self).get_initial()
        initial['book_name'] = guestbook_name
        return initial

    def form_valid(self, form):
        if self.request.method == 'POST':
            guestbook_name = self.request.POST.get('book_name', DEFAULT_GUESTBOOK_NAME)
            greeting = Greeting(parent=guestbook_key(guestbook_name))
            if users.get_current_user():
                greeting.author = Author(
                        identity=users.get_current_user().user_id(),
                        email=users.get_current_user().email())

            greeting.content = self.request.POST.get('greeting_message')

            greeting.put()

            return HttpResponseRedirect('/map/?' + urllib.urlencode({'guestbook_name': guestbook_name}))
            return super(SignView, self).form_valid(form)
