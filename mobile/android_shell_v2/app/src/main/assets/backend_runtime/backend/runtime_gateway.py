from __future__ import annotations

import socket
from functools import lru_cache
from contextlib import contextmanager
from contextvars import ContextVar, Token
from urllib.parse import urlsplit, urlunsplit


_REQUEST_GATEWAY_API_KEY: ContextVar[str] = ContextVar("request_gateway_api_key", default="")
_REQUEST_GATEWAY_BASE_URL: ContextVar[str] = ContextVar("request_gateway_base_url", default="")
_REQUEST_GATEWAY_MODEL: ContextVar[str] = ContextVar("request_gateway_model", default="")


def _normalize_text(value: str | None) -> str:
    return str(value or "").strip()


@contextmanager
def request_gateway_overrides(
    api_key: str | None = None,
    base_url: str | None = None,
    model: str | None = None,
):
    api_key_token: Token[str] = _REQUEST_GATEWAY_API_KEY.set(_normalize_text(api_key))
    base_url_token: Token[str] = _REQUEST_GATEWAY_BASE_URL.set(_normalize_text(base_url))
    model_token: Token[str] = _REQUEST_GATEWAY_MODEL.set(_normalize_text(model))
    try:
        yield
    finally:
        _REQUEST_GATEWAY_API_KEY.reset(api_key_token)
        _REQUEST_GATEWAY_BASE_URL.reset(base_url_token)
        _REQUEST_GATEWAY_MODEL.reset(model_token)


def get_request_gateway_api_key() -> str:
    return _normalize_text(_REQUEST_GATEWAY_API_KEY.get())


def _normalize_chat_completions_url(base: str) -> str:
    url = _normalize_text(base)
    if not url:
        return ""
    url = url.rstrip("/")
    lower = url.lower()
    if lower.endswith("/v1/chat/completions"):
        return url
    if lower.endswith("/v1"):
        return f"{url}/chat/completions"
    return f"{url}/v1/chat/completions"


@lru_cache(maxsize=1)
def _local_host_candidates() -> set[str]:
    hosts: set[str] = {"localhost", "127.0.0.1", "::1"}
    try:
        name = str(socket.gethostname() or "").strip().lower()
        if name:
            hosts.add(name)
        fqdn = str(socket.getfqdn() or "").strip().lower()
        if fqdn:
            hosts.add(fqdn)
    except OSError:
        pass
    try:
        _, _, addrs = socket.gethostbyname_ex(socket.gethostname())
        for addr in addrs:
            text = str(addr or "").strip().lower()
            if text:
                hosts.add(text)
    except OSError:
        pass
    try:
        infos = socket.getaddrinfo(socket.gethostname(), None)
        for item in infos:
            sockaddr = item[4]
            if isinstance(sockaddr, tuple) and sockaddr:
                text = str(sockaddr[0] or "").strip().lower()
                if text:
                    hosts.add(text)
    except OSError:
        pass
    return hosts


def _rewrite_self_host_to_loopback(chat_url: str) -> str:
    url = _normalize_text(chat_url)
    if not url:
        return ""
    try:
        parsed = urlsplit(url)
    except ValueError:
        return url
    host = str(parsed.hostname or "").strip().lower()
    if not host or host in {"localhost", "127.0.0.1", "::1"}:
        return url
    if host not in _local_host_candidates():
        return url
    port = f":{parsed.port}" if parsed.port else ""
    loopback_netloc = f"127.0.0.1{port}"
    if parsed.username:
        auth = parsed.username
        if parsed.password:
            auth = f"{auth}:{parsed.password}"
        loopback_netloc = f"{auth}@{loopback_netloc}"
    return urlunsplit((parsed.scheme, loopback_netloc, parsed.path, parsed.query, parsed.fragment))


def resolve_openai_chat_completions_url() -> str:
    override = get_request_gateway_base_url()
    normalized = _normalize_chat_completions_url(override)
    if not normalized:
        raise ValueError("X-Gateway-Base-Url is required for model call")
    return _rewrite_self_host_to_loopback(normalized)


def get_request_gateway_base_url() -> str:
    return _normalize_text(_REQUEST_GATEWAY_BASE_URL.get())


def get_request_gateway_model() -> str:
    return _normalize_text(_REQUEST_GATEWAY_MODEL.get())


def resolve_openai_model(default_model: str = "gpt-5.2") -> str:
    model = get_request_gateway_model()
    if model:
        return model
    normalized_default = _normalize_text(default_model)
    return normalized_default or "gpt-5.2"
