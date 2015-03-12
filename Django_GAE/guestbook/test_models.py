__author__ = 'buitheanh'

import pytest
from mock import Mock, MagicMock

from google.appengine.ext import testbed
from google.appengine.ext import ndb
from google.appengine.api import users
from google.appengine.api import datastore_errors

from model import Greeting, Guestbook, Author


class TestGreeting():

	def setup_method(self, method):
		# First, create an instance of the Testbed class.
		self.testbed = testbed.Testbed()
		# Then activate the testbed, which prepares the service stubs for use.
		self.testbed.activate()
		# Next, declare which service stubs you want to use.
		self.testbed.init_datastore_v3_stub()
		self.testbed.init_memcache_stub()
		self.testbed.init_user_stub()

		# Generate database for testing
		for i in (range(1, 21)):
			self.testbed.setup_env(
				USER_EMAIL='test%d@example.com' % i,
				USER_ID='id%d' % i,
				USER_IS_ADMIN='1',
				overwrite=True)

			Greeting(parent=ndb.Key(Guestbook, 'defaul_name'), author=(Author(
				identity=users.get_current_user().user_id(), email=users.get_current_user().email())),
				content='Content for greeting number %d' % i).put()

	def teardown_method(self, method):
		self.testbed.deactivate()

	def test_put_from_dict(self):
		self.testbed.setup_env(
			USER_EMAIL='test@example.com',
			USER_ID='123',
			USER_IS_ADMIN='1',
			overwrite=True)
		data_dic = {'name': 'book1', 'content': 'test for put data'}
		Greeting.put_from_dict(data_dic)
		result_list = Greeting.query().fetch(30)
		assert len(result_list) == 21
		assert result_list[0].content == data_dic['content']
		assert result_list[0].author.email == 'test@example.com'

	def test_entity_to_dic(self):
		greeting = Greeting.query().fetch(30)[0]
		result = greeting.entity_to_dic()
		assert result['content'] == 'Content for greeting number 1'
		assert result['author'] == {'identity': 'id1', 'email': 'test1@example.com'}

	def test_delete_greeting(self):
		key = ndb.Key(Guestbook, 'defaul_name', Greeting, 19)
		Greeting.delete_greeting(key.urlsafe())
		result_list = Greeting.query().fetch(30)
		assert len(result_list) == 19

	def test_update_message(self):
		self.testbed.setup_env(
			USER_EMAIL='test@example.com',
			USER_ID='123',
			USER_IS_ADMIN='1',
			overwrite=True)
		key = ndb.Key(Guestbook, 'defaul_name', Greeting, 20).urlsafe()
		mess = 'New content for unit test!'
		Greeting.update_message(key, mess)
		result_list = Greeting.query().fetch(30)
		assert result_list[19].content == mess
		assert result_list[19].user_update == 'test@example.com'

	def test_get_greeting(self):
		key = ndb.Key(Guestbook, 'defaul_name', Greeting, 20).urlsafe()
		result = Greeting.get_greeting(key)
		assert result.content == "Content for greeting number 20"

	def test_get_list(self):
		guestbook_name = 'defaul_name'
		result_list = Greeting.get_list(guestbook_name)
		assert len(result_list) == 10

	def test_get_list_paging(self):
		guestbook_name = 'defaul_name'
		greeting_per_page = 10
		greetings, next_curs, more = Greeting.get_list_paging(
			guestbook_name, greeting_per_page, None)
		assert len(greetings) == 10
		assert more == True

	# Test with wrong cursor input, must rase BadValueError
	def test_get_list_paging_wrong_cursor(self):
		wrong_cursor = "E-ABAOsB8gEEZGF0ZfoBCQi"
		guestbook_name = 'defaul_name'
		greeting_per_page = 10
		with pytest.raises(datastore_errors.BadValueError):
			Greeting.get_list_paging(guestbook_name, greeting_per_page, wrong_cursor)