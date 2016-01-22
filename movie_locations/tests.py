from django.test import TestCase
from django.core.urlresolvers import reverse

# Create your tests here.
class IndexViewTests (TestCase):
    def test_index_view (self):
        response = self.client.get(reverse('movie_locations:index'))
        self.assertEqual(response.status_code, 200)
