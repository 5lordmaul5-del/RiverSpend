import { View, Text, StyleSheet } from 'react-native';

export default function Home() {
  return (
    <View style={styles.screen}>
      <Text style={styles.logo}>RiverSpend</Text>
      <Text style={styles.shop}>SHOP</Text>
      <Text style={styles.tagline}>YOUR SHOP • YOUR FLOW</Text>
      <Text style={styles.status}>RiverSpendShop Mobile</Text>
      <Text style={styles.ready}>Base app pronta</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#dffcff', padding: 24 },
  logo: { fontSize: 38, fontWeight: '800', color: '#10252a' },
  shop: { marginTop: -4, fontSize: 25, fontWeight: '800', color: '#c99a2e', letterSpacing: 4 },
  tagline: { marginTop: 18, fontSize: 12, letterSpacing: 2, color: '#31555b' },
  status: { marginTop: 42, fontSize: 18, fontWeight: '700', color: '#10252a' },
  ready: { marginTop: 8, fontSize: 14, color: '#52747a' }
});