from google.appengine.ext import ndb
from google.appengine.api import memcache
from google.appengine.api import users
from google.appengine.api import taskqueue

import logging

DEFAULT_GUESTBOOK_NAME = 'de_name'

# We set a parent key on the 'Greetings' to ensure that they are all in the same
# entity group. Queries across the single entity group will be consistent.
# However, the write rate should be limited to ~1/second.


class Author(ndb.Model):
	"""Sub model for representing an author."""
	identity = ndb.StringProperty(indexed=False)
	email = ndb.StringProperty(indexed=False)


class Guestbook(ndb.Model):
	@classmethod
	def get_key(cls, guestbook_name=DEFAULT_GUESTBOOK_NAME):
		return ndb.Key(cls, guestbook_name)


class Greeting(ndb.Model):
	'''Models an individual Guestbook entry.'''
	author = ndb.StructuredProperty(Author)
	content = ndb.StringProperty(indexed=False)
	date = ndb.DateTimeProperty(auto_now_add=True)

	# Use Ggoogle Api Memcache for caching query result.
	@classmethod
	def get_list(cls, guestbook_name=DEFAULT_GUESTBOOK_NAME, count=10):
		greetings = memcache.get('%s:greetings' % guestbook_name)
		if greetings:
			return greetings
		else:  # query from Datastore
			greetings_query = Greeting.query(
				ancestor=Guestbook.get_key(guestbook_name)).order(-Greeting.date)
			greetings = greetings_query.fetch(count)
			# add greeting to memcache
			if greetings:
				if not memcache.set(guestbook_name, greetings, count):
					logging.error('Memcache set failed.')
			return greetings

	@classmethod
	@ndb.transactional(xg=True)
	def put_from_dict(cls, dictionary):
		"""Save greeting to database"""

		email = ""
		greeting = cls(parent=Guestbook.get_key(dictionary['name']))
		if users.get_current_user():
			email = users.get_current_user().email()
			greeting.author = Author(
				identity=users.get_current_user().user_id(),
				email=email)
		greeting.content = dictionary['content']
		greeting.put()

		taskqueue.add(
			url='/sendmail/', params={'sender': email}, transactional=True,
			method='GET')