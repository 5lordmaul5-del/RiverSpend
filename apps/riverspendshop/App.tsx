import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Pressable, ScrollView, TextInput, Image, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const API_URL = 'https://river-spend-mauryle75-8055s-projects.vercel.app/api/products';
const categories = ['🔥 In evidenza', '📱 Elettronica', '👟 Moda', '🏠 Casa', '🚲 Sport', '🎮 Gaming'];

export default function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) throw new Error('Errore Market');
        return response.json();
      })
      .then((data) => { if (active) setProducts(Array.isArray(data) ? data : []); })
      .catch(() => { if (active) setError('Market temporaneamente non disponibile.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visibleProducts = products.filter((product) => {
    if (!query.trim()) return true;
    const q = query.trim().toLocaleLowerCase('it');
    return [product.titolo, product.categoria, product.descrizione].some((value) => String(value || '').toLocaleLowerCase('it').includes(q));
  }).slice(0, 12);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View><Text style={styles.logo}>RiverSpend</Text><Text style={styles.shop}>Shop</Text></View>
          <Pressable style={styles.netButton}><Text style={styles.netIcon}>🕸️</Text><Text style={styles.netText}>La mia Rete</Text></Pressable>
        </View>
        <Text style={styles.tagline}>YOUR SHOP • YOUR FLOW</Text>
        <View style={styles.searchBox}><Text style={styles.searchIcon}>⌕</Text><TextInput value={query} onChangeText={setQuery} placeholder="Cerca nel RiverSpendShop" placeholderTextColor="#789096" style={styles.search} /></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>{categories.map((item) => <Pressable key={item} style={styles.category}><Text style={styles.categoryText}>{item}</Text></Pressable>)}</ScrollView>

        <View style={styles.hero}>
          <Text style={styles.heroEyebrow}>RIVERSPENDSHOP</Text><Text style={styles.heroTitle}>Il tuo mercato.</Text><Text style={styles.heroTitle}>Il tuo flusso.</Text>
          <Text style={styles.heroText}>Scopri prodotti, occasioni e nuovi arrivi nella tua Rete.</Text>
          <Pressable style={styles.heroButton}><Text style={styles.heroButtonText}>Esplora il Market →</Text></Pressable>
        </View>

        <View style={styles.sectionHead}><Text style={styles.sectionTitle}>✨ Prodotti del Market</Text><Text style={styles.sectionLink}>{products.length} disponibili</Text></View>
        {loading && <View style={styles.stateCard}><ActivityIndicator size="small" color="#0f766e" /><Text style={styles.stateText}>Caricamento prodotti reali…</Text></View>}
        {!loading && error !== '' && <View style={styles.stateCard}><Text style={styles.emptyIcon}>🌊</Text><Text style={styles.emptyTitle}>Market non raggiungibile</Text><Text style={styles.stateText}>{error}</Text></View>}
        {!loading && !error && visibleProducts.length === 0 && <View style={styles.stateCard}><Text style={styles.emptyIcon}>🌊</Text><Text style={styles.emptyTitle}>Nessun prodotto trovato</Text><Text style={styles.stateText}>Prova una ricerca diversa.</Text></View>}

        <View style={styles.grid}>{visibleProducts.map((product) => {
          const image = Array.isArray(product.immagini) ? product.immagini[0] : '';
          return <Pressable key={product.id} style={styles.productCard}>
            {image ? <Image source={{ uri: image }} style={styles.productImage} resizeMode="contain" /> : <View style={styles.noImage}><Text style={styles.noImageText}>🌊</Text></View>}
            <Text numberOfLines={2} style={styles.productTitle}>{product.titolo || 'Prodotto'}</Text>
            <Text style={styles.productPrice}>€ {Number(product.prezzo || 0).toFixed(2)}</Text>
            <Text numberOfLines={1} style={styles.productMeta}>{product.venditoreTipo || 'Privato'} · {product.categoria || 'Market'}</Text>
          </Pressable>;
        })}</View>

        <View style={styles.appsRow}><View style={styles.miniCard}><Text style={styles.miniIcon}>🔮</Text><Text style={styles.miniTitle}>RS FORCE</Text></View><View style={styles.miniCard}><Text style={styles.miniIcon}>🎡</Text><Text style={styles.miniTitle}>RS FORTUNE</Text></View><View style={styles.miniCard}><Text style={styles.miniIcon}>🎟️</Text><Text style={styles.miniTitle}>RS LOTTERY</Text></View></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#f7fbfb'},container:{padding:18,paddingBottom:40},header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:8},
  logo:{fontSize:30,fontWeight:'900',color:'#111827'},shop:{marginTop:-5,fontSize:25,fontStyle:'italic',fontWeight:'900',color:'#b08a3c',marginLeft:7},tagline:{marginTop:3,fontSize:9,letterSpacing:1.7,color:'#64748b'},
  netButton:{alignItems:'center',paddingVertical:8,paddingHorizontal:10,borderRadius:14,backgroundColor:'#e5f8f7'},netIcon:{fontSize:20},netText:{marginTop:2,fontSize:9,fontWeight:'800',color:'#0f766e'},
  searchBox:{marginTop:18,flexDirection:'row',alignItems:'center',backgroundColor:'#fff',borderWidth:1,borderColor:'#dbe4e7',borderRadius:16,paddingHorizontal:13},searchIcon:{fontSize:25,color:'#0f766e'},search:{flex:1,paddingVertical:13,paddingHorizontal:8,fontSize:14,color:'#111827'},
  categories:{paddingVertical:14,gap:8},category:{backgroundColor:'#fff',borderWidth:1,borderColor:'#dbe4e7',borderRadius:18,paddingHorizontal:12,paddingVertical:9},categoryText:{fontSize:11,fontWeight:'700',color:'#334155'},
  hero:{marginTop:5,borderRadius:24,padding:22,backgroundColor:'#dffcff',borderWidth:1,borderColor:'#b8e9eb'},heroEyebrow:{fontSize:10,fontWeight:'900',letterSpacing:2,color:'#0f766e'},heroTitle:{marginTop:2,fontSize:30,lineHeight:32,fontWeight:'900',color:'#10252a'},heroText:{marginTop:10,maxWidth:300,fontSize:14,lineHeight:20,color:'#31555b'},heroButton:{alignSelf:'flex-start',marginTop:17,paddingHorizontal:16,paddingVertical:11,borderRadius:14,backgroundColor:'#0f766e'},heroButtonText:{color:'#fff',fontSize:12,fontWeight:'900'},
  sectionHead:{marginTop:25,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},sectionTitle:{fontSize:19,fontWeight:'900',color:'#111827'},sectionLink:{fontSize:11,fontWeight:'800',color:'#0f766e'},
  stateCard:{marginTop:12,alignItems:'center',padding:25,borderRadius:20,backgroundColor:'#fff',borderWidth:1,borderColor:'#dbe4e7'},emptyIcon:{fontSize:30},emptyTitle:{marginTop:7,fontSize:17,fontWeight:'800',color:'#111827'},stateText:{marginTop:7,textAlign:'center',fontSize:13,lineHeight:19,color:'#64748b'},
  grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',marginTop:12},productCard:{width:'48.5%',marginBottom:12,padding:10,borderRadius:18,backgroundColor:'#fff',borderWidth:1,borderColor:'#dbe4e7'},productImage:{width:'100%',height:145,backgroundColor:'#fff',borderRadius:12},noImage:{height:145,alignItems:'center',justifyContent:'center',backgroundColor:'#eef9fa',borderRadius:12},noImageText:{fontSize:30},productTitle:{marginTop:8,fontSize:13,fontWeight:'800',color:'#111827'},productPrice:{marginTop:5,fontSize:16,fontWeight:'900',color:'#0f766e'},productMeta:{marginTop:4,fontSize:10,color:'#64748b'},
  appsRow:{flexDirection:'row',gap:8,marginTop:8},miniCard:{flex:1,alignItems:'center',paddingVertical:13,borderRadius:16,backgroundColor:'#fff',borderWidth:1,borderColor:'#dbe4e7'},miniIcon:{fontSize:20},miniTitle:{marginTop:5,fontSize:8,fontWeight:'900',color:'#334155'}
});
