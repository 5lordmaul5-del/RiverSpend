import unittest
from rc222_shield_audit import audit_message

class ShieldAuditTests(unittest.TestCase):
    def test_detect_short_link_and_urgency(self):
        r=audit_message({"id":"1","subject":"Urgent","body":"Your account suspended. Click https://bit.ly/x"})
        self.assertGreaterEqual(r["risk_score"],25)
        self.assertIn("body",r["inspected_fields"])
    def test_metadata_only(self):
        r=audit_message({"id":"2","subject":"hello","body":"send password now"},inspect_body=False)
        self.assertNotIn("CREDENTIAL_REQUEST",[f["rule_id"] for f in r["findings"]])
        self.assertNotIn("body",r["inspected_fields"])
    def test_attachment_extension(self):
        r=audit_message({"id":"3","attachment_names":["invoice.exe"]})
        self.assertIn("EXECUTABLE_ATTACHMENT",[f["rule_id"] for f in r["findings"]])

if __name__=="__main__": unittest.main()
