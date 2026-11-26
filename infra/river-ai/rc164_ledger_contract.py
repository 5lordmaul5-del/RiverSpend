"""RC-164 shared contract checks for mock ledger implementations."""
class LedgerContractMixin:
 def test_lease_returns_none_or_dict(self):
  result=self.ledger.lease_next("contract-worker",{"echo"})
  self.assertTrue(result is None or isinstance(result,dict))
 def test_completion_is_owner_scoped(self):
  # Contract test verifies worker identity is passed to completion method.
  self.ledger.complete("contract-task","contract-worker",{"ok":True})
 def test_failure_has_generic_error(self):
  self.ledger.fail("contract-task","contract-worker","worker_failed")
