from pynamodb.models import Model
from pynamodb.attributes import UnicodeAttribute
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class GlobalModel(Model):
    """
    A DynamoDB User
    """
    class Meta:
        table_name = 'conecte-os-globais'
        region = 'us-east-2'

    pk = UnicodeAttribute(hash_key=True)
    sk = UnicodeAttribute(range_key=True)
    email = UnicodeAttribute()
    novela = UnicodeAttribute()
    ator = UnicodeAttribute()
    personagem = UnicodeAttribute()