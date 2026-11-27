import unittest
from rc202_market_intelligence import analyze_market

class TestMarketIntelligence(unittest.TestCase):
    def rows(self, n=60, trend=1):
        return [{"close":100+i*trend,"high":101+i*trend,"low":99+i*trend} for i in range(n)]
    def test_uptrend(self):
        out=analyze_market(self.rows())
        self.assertEqual(out["market_bias"],"Bias positivo")
        self.assertIsNotNone(out["rsi14"])
    def test_downtrend(self):
        out=analyze_market(self.rows(trend=-0.5))
        self.assertEqual(out["market_bias"],"Bias negativo")
    def test_short_input_rejected(self):
        with self.assertRaises(ValueError): analyze_market(self.rows(10))
    def test_invalid_prices_rejected(self):
        rows=self.rows(); rows[0]["close"]=0
        with self.assertRaises(ValueError): analyze_market(rows)
if __name__=="__main__": unittest.main()
