"""Minimal HS256 JWT verification for the local RiverSSAI core.

This verifier requires a caller-supplied key and issuer/audience configuration.
It is dependency-free; no key is read from disk, environment, or network here.
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import math
import time


class JWTVerificationError(ValueError):
    pass


class HS256JWTVerifier:
    def __init__(self, key, issuer, audience, clock=time.time, clock_skew=5, max_lifetime=3600):
        if type(key) is not bytes or len(key) < 32:
            raise ValueError("HS256 key must be at least 32 bytes")
        if type(issuer) is not str or not issuer or type(audience) is not str or not audience:
            raise ValueError("issuer and audience required")
        if not callable(clock):
            raise TypeError("clock must be callable")
        if type(clock_skew) is not int or not 0 <= clock_skew <= 60:
            raise ValueError("clock skew must be bounded")
        if type(max_lifetime) is not int or not 1 <= max_lifetime <= 86400:
            raise ValueError("maximum token lifetime must be bounded")
        self._key = key
        self.issuer = issuer
        self.audience = audience
        self.clock = clock
        self.clock_skew = clock_skew
        self.max_lifetime = max_lifetime

    @staticmethod
    def _decode_segment(segment):
        if type(segment) is not str or not segment or any(
            ch not in "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_" for ch in segment
        ):
            raise JWTVerificationError("invalid base64url segment")
        padded = segment + "=" * ((4 - len(segment) % 4) % 4)
        try:
            return base64.b64decode(padded, altchars=b"-_", validate=True)
        except Exception:
            raise JWTVerificationError("invalid base64url segment") from None

    @classmethod
    def _json_segment(cls, segment):
        try:
            value = json.loads(cls._decode_segment(segment).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            raise JWTVerificationError("invalid JSON segment") from None
        if type(value) is not dict:
            raise JWTVerificationError("JWT segment must be an object")
        return value

    @staticmethod
    def _number(value):
        return type(value) in (int, float) and math.isfinite(value)

    def _verify(self, token):
        if type(token) is not str or not token or len(token) > 8192:
            raise JWTVerificationError("invalid token size")
        parts = token.split(".")
        if len(parts) != 3:
            raise JWTVerificationError("invalid token structure")
        header = self._json_segment(parts[0])
        if set(header) != {"alg", "typ"} or header.get("alg") != "HS256" or header.get("typ") != "JWT":
            raise JWTVerificationError("unsupported JWT header")
        claims = self._json_segment(parts[1])
        signature = self._decode_segment(parts[2])
        signing_input = (parts[0] + "." + parts[1]).encode("ascii")
        expected = hmac.new(self._key, signing_input, hashlib.sha256).digest()
        if len(signature) != 32 or not hmac.compare_digest(signature, expected):
            raise JWTVerificationError("signature invalid")

        if claims.get("iss") != self.issuer:
            raise JWTVerificationError("issuer invalid")
        aud = claims.get("aud")
        if type(aud) is str:
            valid_audience = aud == self.audience
        elif type(aud) is list and len(aud) <= 10 and all(type(x) is str for x in aud):
            valid_audience = self.audience in aud
        else:
            valid_audience = False
        if not valid_audience:
            raise JWTVerificationError("audience invalid")
        subject = claims.get("sub")
        if type(subject) is not str or not subject.strip() or len(subject) > 128:
            raise JWTVerificationError("subject invalid")
        exp, iat = claims.get("exp"), claims.get("iat")
        if not self._number(exp) or not self._number(iat) or exp <= iat:
            raise JWTVerificationError("time claims invalid")
        now = self.clock()
        if exp <= now - self.clock_skew:
            raise JWTVerificationError("token expired")
        if iat > now + self.clock_skew or exp - iat > self.max_lifetime:
            raise JWTVerificationError("token time bounds invalid")
        nbf = claims.get("nbf")
        if nbf is not None and (not self._number(nbf) or nbf > now + self.clock_skew):
            raise JWTVerificationError("token not yet valid")
        return claims

    def verify_user(self, token):
        claims = self._verify(token)
        return {"subject": claims["sub"]}

    def verify_worker(self, token):
        claims = self._verify(token)
        capabilities = claims.get("capabilities")
        if type(capabilities) is not list or len(capabilities) > 128:
            raise JWTVerificationError("worker capabilities invalid")
        if any(type(c) is not str or not c.strip() or len(c) > 128 for c in capabilities):
            raise JWTVerificationError("worker capability invalid")
        if len(set(capabilities)) != len(capabilities):
            raise JWTVerificationError("duplicate worker capability")
        return {"subject": claims["sub"], "capabilities": capabilities}
