from __future__ import annotations

from backend.runtime_gateway import get_request_gateway_api_key


class AuthError(Exception):
    pass


class AuthProvider:
    def authorization_header(self) -> str:
        raise NotImplementedError


class ApiKeyAuthProvider(AuthProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    def authorization_header(self) -> str:
        if not self.api_key:
            raise AuthError("X-Gateway-Api-Key is required")
        return f"Bearer {self.api_key}"


def create_openai_auth_provider() -> AuthProvider:
    api_key = get_request_gateway_api_key()
    if not api_key:
        raise ValueError("X-Gateway-Api-Key is required for model call")
    return ApiKeyAuthProvider(api_key)
