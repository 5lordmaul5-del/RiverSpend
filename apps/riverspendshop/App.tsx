import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <Text style={styles.logo}>RiverSpend</Text>
        <Text style={styles.shop}>Shop</Text>
        <Text style={styles.tagline}>YOUR SHOP • YOUR FLOW</Text>
        <View style={styles.card}>
          <Text style={styles.title}>RiverSpendShop App</Text>
          <Text style={styles.text}>
            Base mobile pronta. Prossimi moduli: accesso, catalogo, fotocamera,
            video, pubblicazione prodotto, Rete, ordini e notifiche.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7fbfb' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { fontSize: 42, fontWeight: '900', color: '#111827' },
  shop: { marginTop: -6, fontSize: 34, fontStyle: 'italic', fontWeight: '800', color: '#b08a3c' },
  tagline: { marginTop: 10, fontSize: 12, letterSpacing: 2, color: '#64748b' },
  card: { width: '100%', marginTop: 32, padding: 22, borderRadius: 22, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#dbe4e7' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },
  text: { marginTop: 10, fontSize: 15, lineHeight: 22, color: '#475569' }
});
