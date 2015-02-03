from django.http import HttpResponseRedirect
from django.views.generic.simple import direct_to_template

from google.appengine.api import users
from google.appengine.api import memcache

from guestbook.models import Greeting, Author, guestbook_key, DEFAULT_GUESTBOOK_NAME

import urllib
import logging

def main_page(request):
    guestbook_name = request.GET.get('guestbook_name', DEFAULT_GUESTBOOK_NAME)
    
    # Ancestor Queries, as shown here, are strongly consistent with the High
    # Replication Datastore. Queries that span entity groups are eventually
    # consistent. If we omitted the ancestor from this query there would be
    # a slight chance that Greeting that had just been written would not
    # show up in a query.

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
        url = users.create_logout_url(request.get_full_path())
        url_linktext = 'Logout'
    else:
        url = users.create_login_url(request.get_full_path())
        url_linktext = 'Login'


    template_values = {
        'current_user': current_user,
        'greetings': greetings,
        'guestbook_name': guestbook_name,
        'url': url,
        'url_linktext': url_linktext,
    }
    return direct_to_template(request, 'guestbook/main_page.html', template_values)

def sign_post(request):
    if request.method == 'POST':
        guestbook_name = request.POST.get('guestbook_name', DEFAULT_GUESTBOOK_NAME)
        greeting = Greeting(parent=guestbook_key(guestbook_name))
    
        if users.get_current_user():
            greeting.author = Author(
                    identity=users.get_current_user().user_id(),
                    email=users.get_current_user().email())
    
        greeting.content = request.POST.get('content')
        greeting.put()
        return HttpResponseRedirect('/?' + urllib.urlencode({'guestbook_name': guestbook_name}))
    return HttpResponseRedirect('/')