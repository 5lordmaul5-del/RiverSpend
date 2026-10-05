import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const sections = [
  ['🎬','Film','Film, cortometraggi e RiverSpend Originals'],
  ['🎵','Musica','Videoclip, concerti e catalogo musicale'],
  ['📺','Serie & Creator','Serie, programmi e creator'],
  ['🔴','Live','Eventi e dirette'],
  ['⭐','Originals','Produzioni RiverSpend'],
  ['🛒','Shop','Prodotti collegati ai contenuti'],
];

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.brand}>RiverSpend</Text>
        <Text style={styles.title}>Stream</Text>
        <Text style={styles.tagline}>WATCH • LISTEN • EXPERIENCE</Text>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>RiverSpendStream</Text>
          <Text style={styles.heroText}>Un account RiverSpend per smartphone, tablet, web e future piattaforme TV.</Text>
        </View>
        <View style={styles.grid}>
          {sections.map(([icon, title, text]) => (
            <View key={title} style={styles.card}>
              <Text style={styles.icon}>{icon}</Text>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardText}>{text}</Text>
            </View>
          ))}
        </View>
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>🛡️ Rights Check</Text>
          <Text style={styles.noticeText}>I contenuti vengono pubblicati e monetizzati solo con diritti e autorizzazioni verificati.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617' },
  container: { padding: 22, paddingBottom: 40 },
  brand: { fontSize: 22, fontWeight: '900', color: '#67e8f9' },
  title: { marginTop: -2, fontSize: 38, fontWeight: '900', color: '#fff' },
  tagline: { marginTop: 6, fontSize: 11, letterSpacing: 2, color: '#94a3b8' },
  hero: { marginTop: 28, padding: 22, borderRadius: 24, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#134e4a' },
  heroTitle: { fontSize: 25, fontWeight: '900', color: '#fff' },
  heroText: { marginTop: 10, fontSize: 15, lineHeight: 22, color: '#cbd5e1' },
  grid: { marginTop: 18, gap: 12 },
  card: { padding: 18, borderRadius: 20, backgroundColor: '#0b1220', borderWidth: 1, borderColor: '#1e293b' },
  icon: { fontSize: 28 },
  cardTitle: { marginTop: 8, fontSize: 18, fontWeight: '800', color: '#fff' },
  cardText: { marginTop: 5, fontSize: 14, lineHeight: 20, color: '#94a3b8' },
  notice: { marginTop: 18, padding: 18, borderRadius: 20, backgroundColor: '#172554', borderWidth: 1, borderColor: '#1d4ed8' },
  noticeTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  noticeText: { marginTop: 7, lineHeight: 21, color: '#dbeafe' }
});
