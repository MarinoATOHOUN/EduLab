from hashids import Hashids
from django.conf import settings

class HashIdService:
    _hasher = Hashids(salt=getattr(settings, 'HASHIDS_SALT', settings.SECRET_KEY), min_length=8)

    @classmethod
    def encode(cls, id_val):
        if id_val is None:
            return None
        return cls._hasher.encode(id_val)

    @classmethod
    def decode(cls, hash_val):
        if not hash_val:
            return None
        try:
            decoded = cls._hasher.decode(hash_val)
            if decoded:
                return decoded[0]
        except:
            pass
        return None
