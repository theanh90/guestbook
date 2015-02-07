from google.appengine.ext import ndb
from google.appengine.api import memcache
import logging

DEFAULT_GUESTBOOK_NAME = 'de_name'

# We set a parent key on the 'Greetings' to ensure that they are all in the same
# entity group. Queries across the single entity group will be consistent.
# However, the write rate should be limited to ~1/second.

class Author(ndb.Model):
    """Sub model for representing an author."""
    identity = ndb.StringProperty(indexed=False)
    email = ndb.StringProperty(indexed=False)

class Greeting(ndb.Model):
    '''Models an individual Guestbook entry.'''
    author = ndb.StructuredProperty(Author)
    content = ndb.StringProperty(indexed=False)
    date = ndb.DateTimeProperty(auto_now_add=True)

    def guestbook_key(self, guestbook_name=DEFAULT_GUESTBOOK_NAME):
        '''Constructs a Datastore key for a Guestbook entity with guestbook_name.'''
        return ndb.Key(Greeting, guestbook_name)

    #Use Ggoogle Api Memcache for caching query result.
    def get_list(self, guestbook_name, count):
        greetings = memcache.get('%s:greetings' % guestbook_name)
        if greetings:
            return greetings
        else: #query from Datastore
            greetings_query = Greeting.query(ancestor=self.guestbook_key(guestbook_name)).order(-Greeting.date)
            greetings = greetings_query.fetch(count)
            #add greeting to memcache
            if greetings:
                if not memcache.set(guestbook_name, greetings, count):
                    logging.error('Memcache set failed.')
        return greetings
