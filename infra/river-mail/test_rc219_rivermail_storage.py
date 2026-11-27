import tempfile,os,unittest
from rc219_rivermail_storage import RiverMailStorage
class T(unittest.TestCase):
 def setUp(self):self.t=tempfile.TemporaryDirectory();self.s=RiverMailStorage(os.path.join(self.t.name,"db"),{"free":1000,"plus":5000,"business":10000});self.s.create_account("u")
 def tearDown(self):self.t.cleanup()
 def test_archive_move_and_trash_restore(self):
  mid=self.s.add_message("u","Hello","body");self.assertTrue(self.s.archive("u",mid));self.assertEqual(self.s.list_messages("u","archive")[0]["id"],mid);self.assertTrue(self.s.trash("u",mid));self.assertTrue(self.s.restore("u",mid));self.assertEqual(self.s.list_messages("u")[0]["id"],mid)
 def test_folder(self):
  self.s.create_folder("u","Family");mid=self.s.add_message("u","Hi","body");self.assertTrue(self.s.move("u",mid,"Family"));self.assertEqual(self.s.list_messages("u","Family")[0]["id"],mid)
 def test_attachment_usage_and_quota(self):
  mid=self.s.add_message("u","Subject","body");self.s.add_attachment("u",mid,"x.bin","application/octet-stream",b"abc");self.assertGreaterEqual(self.s.quota("u")["used_bytes"],7);self.assertEqual(self.s.attachments("u",mid)[0]["size"],3)
 def test_over_quota(self):
  self.s.create_account("small","free");self.s.quotas["free"]=5;mid=self.s.add_message("small","x","");self.assertRaises(ValueError,self.s.add_attachment,"small",mid,"big","x",b"123456")
 def test_purge(self):
  mid=self.s.add_message("u","trash","x");self.s.add_attachment("u",mid,"a","x",b"123");self.assertTrue(self.s.trash("u",mid));self.assertTrue(self.s.purge("u",mid));self.assertEqual(self.s.attachments("u",mid),[])
if __name__=="__main__":unittest.main()
