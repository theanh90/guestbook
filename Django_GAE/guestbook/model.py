import datetime
import logging

from google.appengine.ext import ndb
from google.appengine.api import memcache
from google.appengine.api import users
from google.appengine.ext.db import Error

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
	content = ndb.StringProperty(indexed=True)
	user_update = ndb.StringProperty(indexed=True)
	date_update = ndb.DateTimeProperty()
	date = ndb.DateTimeProperty(auto_now_add=True)

	@classmethod
	def get_key(cls, id, guestbook_name=DEFAULT_GUESTBOOK_NAME):
		return ndb.Key(Guestbook, guestbook_name, cls, int(id)).urlsafe()

	# Use Ggoogle Api Memcache for caching query result.
	@classmethod
	def get_list(cls, guestbook_name=DEFAULT_GUESTBOOK_NAME, count=10):
		greetings = memcache.get('%s:greetings' % guestbook_name)
		if greetings:
			return greetings
		else:  # query from Datastore
			greetings_query = cls.query(
				ancestor=Guestbook.get_key(guestbook_name)).order(-Greeting.date)
			greetings = greetings_query.fetch(count)
			# add greeting to memcache
			if greetings:
				if not memcache.set(guestbook_name, greetings, count):
					logging.error('Memcache set failed.')
			return greetings

	@classmethod
	def get_list_paging(cls, guestbook_name, count, cursor):
		greetings_query = cls.query(
			ancestor=Guestbook.get_key(guestbook_name)).order(-Greeting.date)
		result = greetings_query.fetch_page(count, start_cursor=ndb.Cursor(urlsafe=cursor))
		return result

	@classmethod
	def put_from_dict(cls, dictionary):
		"""Save greeting to database"""
		greeting = cls(parent=Guestbook.get_key(dictionary['name']))
		if users.get_current_user():
			greeting.author = Author(
				identity=users.get_current_user().user_id(),
				email=users.get_current_user().email())
		greeting.content = dictionary['content']
		logging.warning(greeting)
		greeting.put()

	@classmethod
	def get_greeting(cls, key):
		greeting = ndb.Key(urlsafe=key).get()
		return greeting

	@classmethod
	def update_message(cls, key, message):
		user = users.get_current_user().email()
		greeting = ndb.Key(urlsafe=key).get()
		greeting.content = message
		greeting.user_update = user
		greeting.date_update = datetime.datetime.now()
		greeting.put()

	@classmethod
	def delete_greeting(cls, key):
		greeting = ndb.Key(urlsafe=key).get()
		greeting.key.delete()

	@classmethod
	def greetings_to_dict(cls, guestbook_name=DEFAULT_GUESTBOOK_NAME, count=10, cursor=None):
		greetings, next_curs, more = cls.get_list_paging(guestbook_name, count, cursor)
		list = []
		for greeting in greetings:
			list.append(greeting.to_dict())

		return list, next_curs, more

	def to_dict(self):
		dict = {}
		dict['content'] = self.content
		dict['date'] = self.date.strftime("%Y-%m-%d %H:%M")
		dict['id'] = self.key.id()
		if self.author:
			dict['author'] = {'identity': self.author.identity, 'email': self.author.email}
		if self.user_update:
			dict['user_update'] = self.user_update
			dict['date_update'] = self.date_update.strftime("%Y-%m-%d %H:%M")
		return dict