import React from 'react';
import { SafeAreaView, StyleSheet, Text, View, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const modules = [
  ['📊','Dashboard CEO','Incassi, vendite, utenti e KPI'],
  ['👥','Utenti & venditori','Ruoli, verifiche e blocchi'],
  ['🛍️','Market','Prodotti, categorie e moderazione'],
  ['💳','RiverSpend Pay','Pagamenti, rimborsi e riconciliazione'],
  ['📦','RiverSpend Box','Spedizioni e tracking'],
  ['🛡️','Shield','Protezione, reclami e dispute'],
  ['📢','RS Spons','Campagne, budget e report'],
  ['🎵','Music','Release, diritti e royalties'],
  ['📺','Stream','Contenuti, live e Rights Check'],
  ['🧾','Audit','Azioni amministrative e sicurezza'],
];

export default function App() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.brand}>RiverSpend</Text>
        <Text style={styles.title}>Panel Control</Text>
        <Text style={styles.badge}>RSPC • CEO / COLLABORATORI AUTORIZZATI</Text>
        <View style={styles.lock}><Text style={styles.lockTitle}>🔐 Area privata</Text><Text style={styles.lockText}>Accesso e autorizzazioni saranno verificati con RiverSpend Auth. Nessuna chiave service-role viene inserita nell'app.</Text></View>
        <View style={styles.grid}>
          {modules.map(([icon,title,text]) => <View key={title} style={styles.card}><Text style={styles.icon}>{icon}</Text><Text style={styles.cardTitle}>{title}</Text><Text style={styles.text}>{text}</Text></View>)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#07131a' },
  container: { padding: 22, paddingBottom: 40 },
  brand: { marginTop: 18, fontSize: 24, fontWeight: '900', color: '#8ee8e8' },
  title: { marginTop: 3, fontSize: 36, fontWeight: '900', color: '#fff' },
  badge: { marginTop: 10, fontSize: 10, letterSpacing: 1.4, color: '#d6b35a', fontWeight: '900' },
  lock: { marginTop: 24, padding: 18, borderRadius: 20, backgroundColor: '#10232c', borderWidth: 1, borderColor: '#d6b35a' },
  lockTitle: { fontSize: 17, fontWeight: '900', color: '#fff' },
  lockText: { marginTop: 7, lineHeight: 20, color: '#b7c8cf' },
  grid: { marginTop: 16, gap: 10 },
  card: { padding: 17, borderRadius: 18, backgroundColor: '#10232c', borderWidth: 1, borderColor: '#284653' },
  icon: { fontSize: 25 },
  cardTitle: { marginTop: 7, fontSize: 17, fontWeight: '800', color: '#fff' },
  text: { marginTop: 4, fontSize: 13, lineHeight: 19, color: '#9fb2ba' }
});