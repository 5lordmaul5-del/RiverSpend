import base64
import hashlib
import hmac
import json
import unittest

from river_ssai_jwt import HS256JWTVerifier, JWTVerificationError


KEY = b"local-test-key-not-for-production-0123456789"
ISSUER = "riverspend-test"
AUDIENCE = "river-ssai-test"
NOW = 1700000000


def b64(data):
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def sign(claims, header=None, key=KEY):
    header = header or {"alg":"HS256","typ":"JWT"}
    a = b64(json.dumps(header,separators=(",",":"),sort_keys=True).encode())
    b = b64(json.dumps(claims,separators=(",",":"),sort_keys=True).encode())
    message = a + "." + b
    sig = b64(hmac.new(key,message.encode("ascii"),hashlib.sha256).digest())
    return message + "." + sig


def base_claims(**extra):
    claims={"iss":ISSUER,"aud":AUDIENCE,"sub":"alice","iat":NOW,"exp":NOW+60}
    claims.update(extra)
    return claims


class JWTVerifierTests(unittest.TestCase):
    def setUp(self):
        self.verifier=HS256JWTVerifier(KEY,ISSUER,AUDIENCE,clock=lambda:NOW)

    def test_user_and_worker_claims_are_normalized(self):
        user=self.verifier.verify_user(sign(base_claims()))
        self.assertEqual(user,{"subject":"alice"})
        worker=self.verifier.verify_worker(sign(base_claims(sub="worker-a",capabilities=["echo"])))
        self.assertEqual(worker,{"subject":"worker-a","capabilities":["echo"]})

    def test_bad_signature_rejected(self):
        token=sign(base_claims())
        parts=token.split(".")
        parts[1]=b64(json.dumps(base_claims(sub="mallory"),separators=(",",":"),sort_keys=True).encode())
        with self.assertRaises(JWTVerificationError): self.verifier.verify_user(".".join(parts))

    def test_wrong_issuer_rejected(self):
        with self.assertRaises(JWTVerificationError): self.verifier.verify_user(sign(base_claims(iss="wrong")))

    def test_wrong_audience_rejected(self):
        with self.assertRaises(JWTVerificationError): self.verifier.verify_user(sign(base_claims(aud="wrong")))

    def test_expired_rejected(self):
        with self.assertRaises(JWTVerificationError): self.verifier.verify_user(sign(base_claims(exp=NOW-1)))

    def test_future_not_before_rejected(self):
        with self.assertRaises(JWTVerificationError): self.verifier.verify_user(sign(base_claims(nbf=NOW+20)))

    def test_future_issue_time_rejected(self):
        with self.assertRaises(JWTVerificationError): self.verifier.verify_user(sign(base_claims(iat=NOW+20,exp=NOW+60)))

    def test_lifetime_bound_rejected(self):
        with self.assertRaises(JWTVerificationError): self.verifier.verify_user(sign(base_claims(exp=NOW+7200)))

    def test_algorithm_and_header_rejected(self):
        with self.assertRaises(JWTVerificationError): self.verifier.verify_user(sign(base_claims(),header={"alg":"none","typ":"JWT"}))
        with self.assertRaises(JWTVerificationError): self.verifier.verify_user(sign(base_claims(),header={"alg":"HS256","typ":"JWT","kid":"unsupported"}))

    def test_worker_capabilities_are_bounded_and_unique(self):
        with self.assertRaises(JWTVerificationError): self.verifier.verify_worker(sign(base_claims(capabilities=["echo","echo"])))
        with self.assertRaises(JWTVerificationError): self.verifier.verify_worker(sign(base_claims(capabilities=[" "])))

    def test_malformed_and_oversized_tokens_rejected(self):
        for token in ("", "a.b.c", "x"*8193, "a..b", "%%%.a.b"):
            with self.subTest(token=token), self.assertRaises(JWTVerificationError):
                self.verifier.verify_user(token)

    def test_configuration_requires_strong_key_and_bounded_skew(self):
        with self.assertRaises(ValueError): HS256JWTVerifier(b"short",ISSUER,AUDIENCE)
        with self.assertRaises(ValueError): HS256JWTVerifier(KEY,ISSUER,AUDIENCE,clock_skew=61)


if __name__ == "__main__":
    unittest.main()
