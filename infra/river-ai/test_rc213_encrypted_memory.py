import tempfile, unittest
from pathlib import Path
from rc213_encrypted_memory import encrypt_file, decrypt_file, generate_key

class RC213Tests(unittest.TestCase):
    def test_round_trip(self):
        with tempfile.TemporaryDirectory() as td:
            p=Path(td); original=p/"input"; enc=p/"encrypted"; out=p/"out"
            original.write_bytes(b"memory backup payload")
            key=generate_key(); encrypt_file(original,enc,key); decrypt_file(enc,out,key)
            self.assertEqual(original.read_bytes(),out.read_bytes())

    def test_tampering_fails_without_plaintext(self):
        with tempfile.TemporaryDirectory() as td:
            p=Path(td); original=p/"input"; enc=p/"encrypted"; out=p/"out"
            original.write_bytes(b"secret")
            key=generate_key(); encrypt_file(original,enc,key)
            blob=bytearray(enc.read_bytes()); blob[-1]^=1; enc.write_bytes(blob)
            with self.assertRaises(Exception): decrypt_file(enc,out,key)
            self.assertFalse(out.exists())

    def test_wrong_key(self):
        with tempfile.TemporaryDirectory() as td:
            p=Path(td); original=p/"input"; enc=p/"encrypted"; out=p/"out"
            original.write_bytes(b"data"); encrypt_file(original,enc,generate_key())
            with self.assertRaises(Exception): decrypt_file(enc,out,generate_key())
            self.assertFalse(out.exists())

if __name__=="__main__": unittest.main()
