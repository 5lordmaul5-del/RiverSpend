import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  const [media, setMedia] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [message, setMessage] = useState('Nessun file selezionato.');

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) { setMessage('📷 Permesso fotocamera non concesso.'); return; }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (!result.canceled) { setMedia(prev => [...prev, ...result.assets]); setMessage('📷 Foto acquisita.'); }
  }

  async function pickMedia() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      selectionLimit: 20,
      quality: 0.85
    });
    if (!result.canceled) { setMedia(result.assets); setMessage('✅ Foto/video pronti per l’annuncio.'); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>RiverSpend</Text>
        <Text style={styles.shop}>Shop</Text>
        <Text style={styles.tagline}>YOUR SHOP • YOUR FLOW</Text>

        <View style={styles.card}>
          <Text style={styles.title}>📸 Crea il tuo annuncio</Text>
          <Text style={styles.text}>Scatta direttamente dal telefono oppure scegli foto e video dalla galleria. Fino a 20 elementi nella selezione.</Text>
          <View style={styles.row}>
            <Pressable onPress={takePhoto} style={styles.primary}><Text style={styles.primaryText}>📷 Scatta foto</Text></Pressable>
            <Pressable onPress={pickMedia} style={styles.secondary}><Text style={styles.secondaryText}>🖼️ Foto / video</Text></Pressable>
          </View>
          <Text style={styles.status}>{message}</Text>
          <Text style={styles.count}>Media selezionati: {media.length} / 20</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>🕸️ La mia rete</Text>
          <Text style={styles.text}>Qui collegheremo catalogo, wishlist, carrello/Rete, ordini e pagamenti RiverSpend Pay.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7fbfb' },
  container: { padding: 22, paddingBottom: 40 },
  logo: { marginTop: 20, fontSize: 42, fontWeight: '900', color: '#111827', textAlign: 'center' },
  shop: { marginTop: -6, fontSize: 34, fontStyle: 'italic', fontWeight: '800', color: '#b08a3c', textAlign: 'center' },
  tagline: { marginTop: 8, fontSize: 11, letterSpacing: 2, color: '#64748b', textAlign: 'center' },
  card: { width: '100%', marginTop: 24, padding: 20, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1, borderColor: '#dbe4e7' },
  title: { fontSize: 21, fontWeight: '800', color: '#111827' },
  text: { marginTop: 9, fontSize: 15, lineHeight: 22, color: '#475569' },
  row: { marginTop: 18, gap: 10 },
  primary: { padding: 14, borderRadius: 14, backgroundColor: '#0f766e', alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '900' },
  secondary: { padding: 14, borderRadius: 14, borderWidth: 1, borderColor: '#0f766e', alignItems: 'center' },
  secondaryText: { color: '#0f766e', fontWeight: '900' },
  status: { marginTop: 14, color: '#334155', fontWeight: '600' },
  count: { marginTop: 6, color: '#64748b', fontSize: 13 }
});