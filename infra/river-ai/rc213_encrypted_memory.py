"""RC213: authenticated encryption envelope for sensitive local memory exports/backups.
Requires the 'cryptography' package. Key is provided by caller, never persisted here.
"""
from __future__ import annotations
import os
from pathlib import Path
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

MAGIC=b"RSRC213\x01"
NONCE_BYTES=12

def encrypt_file(source: str|Path, destination: str|Path, key: bytes) -> dict:
    if len(key) not in (16,24,32): raise ValueError("AES key must be 16, 24 or 32 bytes.")
    src,dst=Path(source),Path(destination)
    data=src.read_bytes()
    nonce=os.urandom(NONCE_BYTES)
    ciphertext=AESGCM(key).encrypt(nonce,data,MAGIC)
    dst.parent.mkdir(parents=True,exist_ok=True)
    dst.write_bytes(MAGIC+nonce+ciphertext)
    return {"ok":True,"bytes_written":dst.stat().st_size,"algorithm":"AES-GCM"}

def decrypt_file(source: str|Path, destination: str|Path, key: bytes) -> dict:
    if len(key) not in (16,24,32): raise ValueError("AES key must be 16, 24 or 32 bytes.")
    src,dst=Path(source),Path(destination)
    blob=src.read_bytes()
    if not blob.startswith(MAGIC) or len(blob)<len(MAGIC)+NONCE_BYTES+16:
        raise ValueError("Invalid or truncated RC213 envelope.")
    offset=len(MAGIC); nonce=blob[offset:offset+NONCE_BYTES]; ciphertext=blob[offset+NONCE_BYTES:]
    # Authentication failures propagate; do not write partial/plaintext output.
    plaintext=AESGCM(key).decrypt(nonce,ciphertext,MAGIC)
    dst.parent.mkdir(parents=True,exist_ok=True)
    tmp=dst.with_name(dst.name+".rc213-tmp")
    tmp.write_bytes(plaintext)
    os.replace(tmp,dst)
    return {"ok":True,"bytes_written":dst.stat().st_size}

def generate_key() -> bytes:
    """Generate key material; caller must store securely outside this module."""
    return AESGCM.generate_key(bit_length=256)
