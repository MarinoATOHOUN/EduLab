from apps.core.utils import HashIdService
from django.http import Http404

class HashIdMixin:
    """
    Mixin pour décoder les IDs hashés dans les URLs.
    À utiliser dans les ViewSets.
    """
    def get_object(self):
        # Identifier le paramètre de l'URL (généralement 'pk')
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        
        if lookup_url_kwarg in self.kwargs:
            encoded_pk = self.kwargs[lookup_url_kwarg]
            
            # Tenter de décoder si c'est une string (ce qui est le cas pour un hashid)
            # Si c'est déjà un int (ex: test interne), on laisse passer
            if isinstance(encoded_pk, str) and not encoded_pk.isdigit():
                decoded_pk = HashIdService.decode(encoded_pk)
                
                if decoded_pk is None:
                    raise Http404("ID invalide")
                
                # Mettre à jour kwargs avec l'ID décodé pour que super().get_object() fonctionne
                self.kwargs[lookup_url_kwarg] = decoded_pk
            
        return super().get_object()
