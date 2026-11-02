from __future__ import annotations

import json
import os
import uuid
from dataclasses import dataclass
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from backend.auth import AuthProvider, create_openai_auth_provider


@dataclass
class TranscriptionResult:
    transcript: str
    provider: str
    raw: dict | None = None


class TranscriptionError(Exception):
    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code
        self.message = message


class ManualTranscriptProvider:
    """Step-3 provider: requires explicit transcript from client."""

    name = "manual"

    def transcribe(self, audio_bytes: bytes, mime_type: str, manual_transcript: str | None = None) -> TranscriptionResult:
        if not audio_bytes:
            raise TranscriptionError("TRANSCRIPT_FAILED", "audio payload is empty")
        text = (manual_transcript or "").strip()
        if not text:
            raise TranscriptionError("TRANSCRIPT_FAILED", "manual transcript is required in manual mode")
        return TranscriptionResult(transcript=text, provider=self.name)


class HttpJsonTranscriptionProvider:
    """
    Generic HTTP JSON provider.
    Expects a JSON endpoint that accepts base64 audio and returns {"text": "..."}.
    """

    name = "http-json"

    def __init__(self, api_url: str, api_key: str, model: str, timeout_seconds: float):
        self.api_url = api_url
        self.api_key = api_key
        self.model = model
        self.timeout_seconds = timeout_seconds

    def transcribe(self, audio_bytes: bytes, mime_type: str, manual_transcript: str | None = None) -> TranscriptionResult:
        import base64

        if not audio_bytes:
            raise TranscriptionError("TRANSCRIPT_FAILED", "audio payload is empty")

        payload = {
            "model": self.model,
            "mime_type": mime_type,
            "audio_base64": base64.b64encode(audio_bytes).decode("ascii"),
        }
        request = Request(
            self.api_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        try:
            with urlopen(request, timeout=self.timeout_seconds) as resp:
                result = json.loads(resp.read().decode("utf-8"))
        except HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            raise TranscriptionError("TRANSCRIPT_FAILED", f"transcription http error: {exc.code}, body={body}") from exc
        except URLError as exc:
            raise TranscriptionError("TRANSCRIPT_FAILED", f"transcription network error: {exc.reason}") from exc
        except json.JSONDecodeError as exc:
            raise TranscriptionError("TRANSCRIPT_FAILED", "transcription response is not valid JSON") from exc

        text = str(result.get("text", "")).strip()
        if not text:
            raise TranscriptionError("TRANSCRIPT_FAILED", "transcription response missing text")
        return TranscriptionResult(transcript=text, provider=self.name, raw=result)


class OpenAITranscriptionProvider:
    """OpenAI transcription provider using /v1/audio/transcriptions."""

    name = "openai"

    def __init__(self, auth_provider: AuthProvider, model: str, timeout_seconds: float, api_url: str):
        self.auth_provider = auth_provider
        self.model = model
        self.timeout_seconds = timeout_seconds
        self.api_url = api_url

    def transcribe(self, audio_bytes: bytes, mime_type: str, manual_transcript: str | None = None) -> TranscriptionResult:
        if not audio_bytes:
            raise TranscriptionError("TRANSCRIPT_FAILED", "audio payload is empty")
        boundary = f"----codex-{uuid.uuid4().hex}"
        filename = f"audio.{self._ext_from_mime(mime_type)}"
        payload = self._build_multipart(
            boundary=boundary,
            model=self.model,
            filename=filename,
            mime_type=mime_type,
            audio_bytes=audio_bytes,
        )
        request = Request(
            self.api_url,
            data=payload,
            headers={
                "Authorization": self.auth_provider.authorization_header(),
                "Content-Type": f"multipart/form-data; boundary={boundary}",
            },
            method="POST",
        )
        try:
            with urlopen(request, timeout=self.timeout_seconds) as resp:
                body = resp.read().decode("utf-8")
        except HTTPError as exc:
            body = exc.read().decode("utf-8", errors="replace")
            raise TranscriptionError("TRANSCRIPT_FAILED", f"openai transcription http error: {exc.code}, body={body}") from exc
        except URLError as exc:
            raise TranscriptionError("TRANSCRIPT_FAILED", f"openai transcription network error: {exc.reason}") from exc

        text = body.strip()
        if not text:
            raise TranscriptionError("TRANSCRIPT_FAILED", "openai transcription response missing text")
        return TranscriptionResult(transcript=text, provider=self.name, raw=None)

    @staticmethod
    def _build_multipart(boundary: str, model: str, filename: str, mime_type: str, audio_bytes: bytes) -> bytes:
        line = "\r\n"
        parts: list[bytes] = []

        parts.append(f"--{boundary}{line}".encode("utf-8"))
        parts.append(f'Content-Disposition: form-data; name="model"{line}{line}'.encode("utf-8"))
        parts.append(model.encode("utf-8"))
        parts.append(line.encode("utf-8"))

        parts.append(f"--{boundary}{line}".encode("utf-8"))
        parts.append(f'Content-Disposition: form-data; name="response_format"{line}{line}'.encode("utf-8"))
        parts.append(b"text")
        parts.append(line.encode("utf-8"))

        parts.append(f"--{boundary}{line}".encode("utf-8"))
        parts.append(
            f'Content-Disposition: form-data; name="file"; filename="{filename}"{line}'.encode("utf-8")
        )
        parts.append(f"Content-Type: {mime_type}{line}{line}".encode("utf-8"))
        parts.append(audio_bytes)
        parts.append(line.encode("utf-8"))

        parts.append(f"--{boundary}--{line}".encode("utf-8"))
        return b"".join(parts)

    @staticmethod
    def _ext_from_mime(mime_type: str) -> str:
        mapping = {
            "audio/webm": "webm",
            "audio/wav": "wav",
            "audio/mp4": "m4a",
            "audio/mpeg": "mp3",
            "audio/ogg": "ogg",
        }
        return mapping.get(mime_type.lower(), "bin")


def create_transcription_provider():
    mode = os.getenv("TRANSCRIPTION_MODE", "manual").strip().lower()
    if mode == "manual":
        return ManualTranscriptProvider()
    if mode == "http-json":
        api_url = os.getenv("TRANSCRIPTION_API_URL", "").strip()
        api_key = os.getenv("TRANSCRIPTION_API_KEY", "").strip()
        model = os.getenv("TRANSCRIPTION_MODEL", "asr-1").strip() or "asr-1"
        timeout_seconds = float(os.getenv("TRANSCRIPTION_TIMEOUT_SECONDS", "20"))
        if not api_url or not api_key:
            raise ValueError("TRANSCRIPTION_MODE=http-json requires TRANSCRIPTION_API_URL and TRANSCRIPTION_API_KEY")
        return HttpJsonTranscriptionProvider(api_url, api_key, model, timeout_seconds)
    if mode == "openai":
        model = os.getenv("OPENAI_TRANSCRIPTION_MODEL", "gpt-4o-mini-transcribe").strip() or "gpt-4o-mini-transcribe"
        timeout_seconds = float(os.getenv("OPENAI_TRANSCRIPTION_TIMEOUT_SECONDS", "20"))
        api_url = os.getenv("OPENAI_TRANSCRIPTION_API_URL", "https://api.openai.com/v1/audio/transcriptions").strip()
        return OpenAITranscriptionProvider(create_openai_auth_provider(), model, timeout_seconds, api_url)
    raise ValueError(f"unsupported TRANSCRIPTION_MODE: {mode}")
