import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Text style={styles.brand}>RiverSpend</Text>
        <Text style={styles.title}>Panel Control</Text>
        <Text style={styles.badge}>RSPC • ADMIN</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Centro di controllo</Text>
          <Text style={styles.text}>
            Base amministrativa pronta. Prossimi moduli: dashboard CEO,
            utenti, venditori, prodotti, segnalazioni, ordini, pagamenti,
            spedizioni, collaboratori e audit.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#07131a' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  brand: { fontSize: 24, fontWeight: '900', color: '#8ee8e8' },
  title: { marginTop: 4, fontSize: 36, fontWeight: '900', color: '#ffffff' },
  badge: { marginTop: 12, fontSize: 12, letterSpacing: 2, color: '#d6b35a', fontWeight: '800' },
  card: { marginTop: 32, padding: 22, borderRadius: 22, backgroundColor: '#10232c', borderWidth: 1, borderColor: '#284653' },
  cardTitle: { fontSize: 21, fontWeight: '800', color: '#ffffff' },
  text: { marginTop: 10, fontSize: 15, lineHeight: 22, color: '#b7c8cf' }
});
