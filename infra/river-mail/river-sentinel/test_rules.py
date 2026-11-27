import unittest
from rules import Signal, evaluate

class RiverSentinelTests(unittest.TestCase):
    def test_empty(self):
        self.assertEqual(evaluate([])["score"], 0)
    def test_forwarding_is_high_signal(self):
        result=evaluate([Signal("forwarding_rule","unexpected forwarding")])
        self.assertEqual(result["score"],35)
        self.assertEqual(result["level"],"medium")
    def test_score_caps(self):
        result=evaluate([Signal("forwarding_rule","x") for _ in range(4)])
        self.assertEqual(result["score"],100)
        self.assertEqual(result["level"],"critical")
if __name__ == "__main__": unittest.main()
