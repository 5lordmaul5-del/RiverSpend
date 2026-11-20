import React, { useMemo, useState } from 'react';
import {
  SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

type Section = 'overview' | 'apps' | 'platform' | 'security' | 'recovery';

const applications = [
  ['RiverSpend', 'Commercio e piattaforma principale'],
  ['RiverSpendShop', 'Applicazione shopping'],
  ['River Video', 'Applicazione video'],
  ['RiverStreaming', 'Piattaforma streaming'],
  ['Enigma / Christopher', 'Messaggistica cifrata — progetto'],
  ['RiverPrint', 'Servizi di stampa'],
  ['RiverSS Print', 'Applicazione stampa'],
  ['RiverSignals', 'Comunicazioni e segnali'],
  ['RiverSpaceSignals', 'Comunità e segnali'],
  ['RiverSpend PlayStoreShop', 'Marketplace digitale'],
  ['RiverSpend PlayStoreGamesShop', 'Marketplace giochi'],
  ['RiverS PlayS', 'Giochi e intrattenimento'],
  ['Quiz Arena', 'Quiz e giochi interattivi'],
  ['Karma Relax Zen', 'Benessere — progetto'],
  ['River AI – Karma Guardian', 'Assistente AI — progetto'],
  ['RiverSpend Panel Control', 'Pannello amministrativo'],
  ['RiverSSAI 10.0', 'Assistente e piattaforma AI'],
] as const;

const services = [
  ['River DataCenter RSS', 'Coordinamento ecosistema', 'Progettazione'],
  ['River Fortress 10.0', 'Controllo, policy e audit', 'Parziale / da verificare'],
  ['RiverCloud', 'Infrastruttura cloud', 'Scaffold / progettazione'],
  ['RiverGit', 'Codice e repository', 'Scaffold locale non avviato'],
  ['RiverDeploy', 'Build e distribuzione', 'Progettazione'],
  ['RiverDatabase', 'Database e dati', 'Progettazione'],
  ['River ID / RiverAuth', 'Identità e autorizzazioni', 'Da integrare'],
  ['River API Gateway', 'Comunicazione tra servizi', 'Da integrare'],
  ['RiverSSAI 10.0', 'Intelligenza artificiale', 'Da verificare'],
  ['River Payments', 'Pagamenti', 'Non attivo'],
  ['River Security', 'Sicurezza e audit', 'Da integrare'],
  ['RiverBackup', 'Copie di sicurezza', 'Piano / da testare'],
  ['RiverRecovery', 'Ripristino e continuità', 'Da testare'],
  ['RiverMonitor', 'Monitoraggio e allarmi', 'Da integrare'],
] as const;

const navigation: { id: Section; label: string; icon: string }[] = [
  { id: 'overview', label: 'Panoramica', icon: '⌂' },
  { id: 'apps', label: 'Applicazioni', icon: '▦' },
  { id: 'platform', label: 'Infrastruttura', icon: '▤' },
  { id: 'security', label: 'Sicurezza', icon: '◇' },
  { id: 'recovery', label: 'Backup & Recovery', icon: '↻' },
];

function StatusPill({ children }: { children: React.ReactNode }) {
  return <View style={styles.statusPill}><Text style={styles.statusText}>{children}</Text></View>;
}

function Metric({ value, label }: { value: string; label: string }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

export default function App() {
  const [section, setSection] = useState<Section>('overview');
  const title = useMemo(() => navigation.find(item => item.id === section)?.label ?? 'Panoramica', [section]);

  const renderRows = (rows: readonly (readonly string[])[]) => rows.map(([name, description, status]) => (
    <View key={name} style={styles.rowCard}>
      <View style={styles.rowMain}>
        <Text style={styles.rowTitle}>{name}</Text>
        <Text style={styles.muted}>{description}</Text>
      </View>
      {status ? <StatusPill>{status}</StatusPill> : <StatusPill>Da verificare</StatusPill>}
    </View>
  ));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>RIVERSPEND • CONTROL PLANE</Text>
          <Text style={styles.brand}>River DataCenter RSS</Text>
          <Text style={styles.subtitle}>Control Center · Fortress 10.0</Text>
        </View>
        <View style={styles.headerMark}><Text style={styles.headerMarkText}>RSS</Text></View>
      </View>

      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>Modalità progettazione · sola lettura</Text>
        <Text style={styles.noticeText}>I servizi non sono ancora collegati al pannello. Gli stati mostrati sono inventario e avanzamento documentale, non telemetria live. Nessun comando operativo è abilitato.</Text>
      </View>

      <View style={styles.navWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.nav}>
          {navigation.map(item => (
            <Pressable key={item.id} onPress={() => setSection(item.id)} style={[styles.navItem, section === item.id && styles.navItemActive]}>
              <Text style={[styles.navText, section === item.id && styles.navTextActive]}>{item.icon}  {item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {section === 'overview' && <>
          <View style={styles.hero}>
            <Text style={styles.heroKicker}>CENTRO DI COMANDO ECOSISTEMA</Text>
            <Text style={styles.heroTitle}>Un solo centro. Servizi indipendenti.</Text>
            <Text style={styles.heroText}>Inventario, sicurezza, stato dei servizi e recupero in un unico pannello. Le azioni saranno abilitate solo dopo autenticazione, autorizzazioni e collegamenti verificati.</Text>
          </View>
          <View style={styles.metrics}>
            <Metric value="17" label="Applicazioni censite" />
            <Metric value="14" label="Servizi piattaforma" />
            <Metric value="31" label="Nodi mappa tecnica" />
          </View>
          <Text style={styles.subheading}>Aree di comando</Text>
          {[
            ['Applicazioni', 'Inventario, proprietario, versione e disponibilità'],
            ['Infrastruttura', 'RiverCloud, RiverGit, RiverDeploy e RiverDatabase'],
            ['Sicurezza', 'Identità, ruoli, policy e registro audit'],
            ['Backup & Recovery', 'Ultimo backup, test di ripristino e procedure'],
          ].map(([name, desc]) => <Pressable key={name} onPress={() => setSection(name === 'Applicazioni' ? 'apps' : name === 'Infrastruttura' ? 'platform' : name === 'Sicurezza' ? 'security' : 'recovery')} style={styles.actionCard}><Text style={styles.actionTitle}>{name}  ›</Text><Text style={styles.muted}>{desc}</Text></Pressable>)}
        </>}
        {section === 'apps' && <>
          <Text style={styles.helper}>Catalogo centrale: 17 applicazioni. La presenza nell'elenco non certifica che l'app sia già online o funzionante.</Text>
          {renderRows(applications)}
        </>}
        {section === 'platform' && <>
          <Text style={styles.helper}>Servizi condivisi: 14 componenti. Stati indicativi derivati dal lavoro documentato sul branch.</Text>
          {renderRows(services)}
        </>}
        {section === 'security' && <>
          <View style={styles.panelCard}>
            <Text style={styles.cardTitle}>Accesso amministrativo</Text>
            <StatusPill>Non collegato</StatusPill>
            <Text style={styles.muted}>River ID / RiverAuth dovrà autenticare gli operatori. Sono previsti ruoli distinti, privilegi minimi, MFA dove supportata e sessioni revocabili.</Text>
          </View>
          <View style={styles.panelCard}>
            <Text style={styles.cardTitle}>Registro audit</Text>
            <StatusPill>Da implementare</StatusPill>
            <Text style={styles.muted}>Ogni futura azione amministrativa dovrà registrare operatore, azione, risorsa, orario, esito e identificativo richiesta. Mai registrare password o token.</Text>
          </View>
          <View style={styles.panelCard}>
            <Text style={styles.cardTitle}>Comandi protetti</Text>
            <StatusPill>Disabilitati</StatusPill>
            <Text style={styles.muted}>Nessun arresto, riavvio, deploy, modifica utenti, pagamento o intervento sui database è disponibile in questa versione.</Text>
          </View>
        </>}
        {section === 'recovery' && <>
          <View style={styles.panelCard}>
            <Text style={styles.cardTitle}>RiverBackup</Text>
            <StatusPill>Da collegare e testare</StatusPill>
            <Text style={styles.muted}>Il pannello mostrerà freschezza delle copie, destinazione, cifratura, esito e dimensione solo quando riceverà dati verificati.</Text>
          </View>
          <View style={styles.panelCard}>
            <Text style={styles.cardTitle}>RiverRecovery</Text>
            <StatusPill>Runbook da completare</StatusPill>
            <Text style={styles.muted}>Ripristino in ambiente isolato, verifica integrità e prova periodica. Un backup non è considerato valido finché non viene ripristinato.</Text>
          </View>
          <View style={styles.panelCard}>
            <Text style={styles.cardTitle}>Obiettivo continuità</Text>
            <Text style={styles.muted}>Separare guasti di applicazione, database, hosting e backup. Il centro di controllo non deve essere un punto unico di guasto.</Text>
          </View>
        </>}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>RIVER CONTROL CENTER</Text>
          <Text style={styles.footerText}>Versione iniziale · inventario locale · nessun collegamento live · budget autorizzato €0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#07121b' },
  header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { color: '#6bd6d0', fontSize: 9, fontWeight: '900', letterSpacing: 1.7 },
  brand: { color: '#fff', fontSize: 23, fontWeight: '900', marginTop: 5 },
  subtitle: { color: '#9bb2c1', fontSize: 12, marginTop: 3 },
  headerMark: { width: 48, height: 48, borderRadius: 15, backgroundColor: '#123541', borderWidth: 1, borderColor: '#27606a', alignItems: 'center', justifyContent: 'center' },
  headerMarkText: { color: '#83e5df', fontWeight: '900', fontSize: 15 },
  notice: { marginHorizontal: 18, padding: 13, borderRadius: 14, backgroundColor: '#332b18', borderWidth: 1, borderColor: '#80652d' },
  noticeTitle: { color: '#f3d38b', fontWeight: '800', fontSize: 12 },
  noticeText: { color: '#d9cba8', fontSize: 11, lineHeight: 17, marginTop: 4 },
  navWrap: { borderBottomWidth: 1, borderBottomColor: '#1b3442', marginTop: 15 },
  nav: { paddingHorizontal: 14, paddingBottom: 10, gap: 7 },
  navItem: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9, backgroundColor: '#102431' },
  navItemActive: { backgroundColor: '#1a5960' },
  navText: { color: '#a9bfca', fontSize: 11, fontWeight: '700' },
  navTextActive: { color: '#fff' },
  content: { padding: 18, paddingBottom: 40 },
  sectionTitle: { color: '#fff', fontSize: 21, fontWeight: '900', marginBottom: 13 },
  hero: { padding: 19, borderRadius: 18, backgroundColor: '#102d3a', borderWidth: 1, borderColor: '#245464' },
  heroKicker: { color: '#76d8d1', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  heroTitle: { color: '#fff', fontSize: 23, fontWeight: '900', lineHeight: 29, marginTop: 10 },
  heroText: { color: '#b7cbd3', fontSize: 12, lineHeight: 19, marginTop: 8 },
  metrics: { flexDirection: 'row', gap: 8, marginTop: 12 },
  metric: { flex: 1, padding: 12, borderRadius: 14, backgroundColor: '#10232e', borderWidth: 1, borderColor: '#203e4c' },
  metricValue: { color: '#8ee5dc', fontSize: 23, fontWeight: '900' },
  metricLabel: { color: '#a6bbc5', fontSize: 9, lineHeight: 13, marginTop: 4 },
  subheading: { color: '#fff', fontSize: 15, fontWeight: '800', marginTop: 21, marginBottom: 9 },
  actionCard: { padding: 15, borderRadius: 13, backgroundColor: '#10232e', borderWidth: 1, borderColor: '#203e4c', marginBottom: 8 },
  actionTitle: { color: '#eaf7f7', fontSize: 14, fontWeight: '800', marginBottom: 4 },
  muted: { color: '#9eb2bd', fontSize: 11, lineHeight: 17 },
  helper: { color: '#9eb2bd', fontSize: 12, lineHeight: 18, marginBottom: 12 },
  rowCard: { padding: 13, borderRadius: 13, backgroundColor: '#10232e', borderWidth: 1, borderColor: '#203e4c', marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowMain: { flex: 1 },
  rowTitle: { color: '#f2f8fa', fontSize: 13, fontWeight: '800', marginBottom: 3 },
  statusPill: { backgroundColor: '#3b321d', borderColor: '#78602d', borderWidth: 1, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, maxWidth: 142 },
  statusText: { color: '#f0d18a', fontSize: 9, fontWeight: '800', textAlign: 'center' },
  panelCard: { padding: 16, borderRadius: 15, backgroundColor: '#10232e', borderWidth: 1, borderColor: '#203e4c', marginBottom: 10, gap: 9 },
  cardTitle: { color: '#fff', fontSize: 15, fontWeight: '900' },
  footer: { marginTop: 18, padding: 15, borderTopWidth: 1, borderTopColor: '#1b3442' },
  footerTitle: { color: '#6bd6d0', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  footerText: { color: '#819aa7', fontSize: 10, lineHeight: 16, marginTop: 5 },
});
