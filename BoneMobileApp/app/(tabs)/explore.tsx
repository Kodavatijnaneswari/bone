import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  Image, 
  SafeAreaView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import axios from 'axios';

const SERVER_IP = '192.168.47.74'; 
const BASE_URL = `http://${SERVER_IP}:8000/api`;

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // For demo, we use userId 1. In a real app, this comes from state/storage.
  const userId = 1; 

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/history/${userId}/`);
      setHistory(response.data);
    } catch (error) {
    //   Alert.alert('Error', 'Could not load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.historyCard}>
      <Image source={{ uri: item.image_url }} style={styles.thumbnail} />
      <View style={styles.info}>
        <Text style={[styles.finding, { color: item.finding === 'Abnormal' ? '#C62828' : '#2E7D32' }]}>
          {item.finding}
        </Text>
        <Text style={styles.category}>{item.category}</Text>
        <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Patient Records</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#1A237E" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>No records found yet.</Text>}
          onRefresh={fetchHistory}
          refreshing={loading}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  title: { fontSize: 24, fontWeight: 'bold', margin: 20, color: '#1A237E' },
  historyCard: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    marginBottom: 15, 
    padding: 10,
    elevation: 2,
    alignItems: 'center'
  },
  thumbnail: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#eee' },
  info: { marginLeft: 15, flex: 1 },
  finding: { fontWeight: 'bold', fontSize: 16 },
  category: { color: '#666', fontSize: 14, marginTop: 2 },
  date: { color: '#aaa', fontSize: 12, marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});
