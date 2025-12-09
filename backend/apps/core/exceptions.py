"""
Custom exception handler for Django REST Framework
Développé par Marino ATOHOUN pour Hypee
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Gestionnaire d'exceptions personnalisé pour DRF
    
    Ajoute des informations supplémentaires aux réponses d'erreur
    et standardise le format de retour.
    """
    # Appeler le gestionnaire par défaut de DRF
    response = exception_handler(exc, context)
    
    if response is not None:
        # Standardiser le format de réponse d'erreur
        custom_response_data = {
            'error': True,
            'status_code': response.status_code,
            'message': None,
            'details': response.data
        }
        
        # Essayer d'extraire un message clair
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                custom_response_data['message'] = response.data['detail']
            elif 'non_field_errors' in response.data:
                custom_response_data['message'] = response.data['non_field_errors'][0]
            else:
                # Prendre le premier message d'erreur trouvé
                for field, errors in response.data.items():
                    if isinstance(errors, list) and errors:
                        custom_response_data['message'] = f"{field}: {errors[0]}"
                        break
        
        # Message par défaut selon le code de statut
        if not custom_response_data['message']:
            if response.status_code == 400:
                custom_response_data['message'] = "Données invalides"
            elif response.status_code == 401:
                custom_response_data['message'] = "Authentification requise"
            elif response.status_code == 403:
                custom_response_data['message'] = "Accès refusé"
            elif response.status_code == 404:
                custom_response_data['message'] = "Ressource non trouvée"
            elif response.status_code == 500:
                custom_response_data['message'] = "Erreur serveur interne"
            else:
                custom_response_data['message'] = "Une erreur est survenue"
        
        response.data = custom_response_data
    
    return response
