__author__ = 'buitheanh'


from django import forms


class ApiEditForm(forms.Form):
	message = forms.CharField(label='Message', max_length=10, required=True)
	book_name = forms.CharField(widget=forms.HiddenInput)


class SignForm(forms.Form):
	greeting_message = forms.CharField(
		label="Greeting message", widget=forms.Textarea, required=True, max_length=100)
	book_name = forms.CharField(label='Guestbook name', max_length=10, required=True)


class EditForm(ApiEditForm):
	key = forms.CharField(widget=forms.HiddenInput)