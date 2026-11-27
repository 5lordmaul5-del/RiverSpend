import unittest
from rc183_saas_entitlements import (
    PolicyError, check_feature, check_task_capacity, check_monthly_budget,
    get_plan, require_feature, require_task_capacity, require_monthly_budget
)

class RC183Tests(unittest.TestCase):
    def test_plan_lookup_and_case(self):
        self.assertEqual(get_plan("PLUS").key, "plus")
        with self.assertRaises(PolicyError): get_plan("unknown")

    def test_feature_entitlement(self):
        self.assertTrue(check_feature("pro", "agents"))
        self.assertFalse(check_feature("free", "agents"))
        with self.assertRaises(PolicyError): require_feature("free", "agents")

    def test_concurrency_boundary(self):
        self.assertTrue(check_task_capacity("free", 0))
        self.assertFalse(check_task_capacity("free", 1))
        with self.assertRaises(PolicyError): require_task_capacity("free", 1)

    def test_budget_boundary(self):
        self.assertTrue(check_monthly_budget("free", 90_000, 10_000))
        self.assertFalse(check_monthly_budget("free", 90_000, 10_001))
        with self.assertRaises(PolicyError): require_monthly_budget("free", 90_000, 10_001)

    def test_invalid_counts(self):
        for bad in (-1, True, "1"):
            with self.assertRaises(PolicyError): check_task_capacity("free", bad)
            with self.assertRaises(PolicyError): check_monthly_budget("free", bad, 0)
        with self.assertRaises(PolicyError): check_monthly_budget("free", 0, -1)

if __name__ == "__main__":
    unittest.main()
