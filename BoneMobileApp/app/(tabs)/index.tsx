import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Image, 
  ScrollView, 
  ActivityIndicator,
  SafeAreaView 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

// IMPORTANT: This matches your computer's IP from the terminal output
const SERVER_IP = '192.168.47.74'; 
const BASE_URL = `http://${SERVER_IP}:8000/api`;

export default function HomeScreen() {
  const [user, setUser] = useState<{username: string, id: number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [result, setResult] = useState<any>(null);
  
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  const handleLogin = async () => {
    if (!loginUser || !loginPass) return Alert.alert('Error', 'Enter credentials');
    try {
      const response = await axios.post(`${BASE_URL}/login/`, { 
        username: loginUser, 
        password: loginPass 
      });
      setUser(response.data);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Login Failed', 'Verify your Django server is running at ' + SERVER_IP);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setResult(null);
    }
  };

  const runDetection = async () => {
    if (!image || !user) return Alert.alert('Error', 'Missing data');
    setLoading(true);

    const formData = new FormData();
    // @ts-ignore
    formData.append('image', {
      uri: image.uri,
      type: 'image/jpeg',
      name: 'xray_scan.jpg',
    });
    formData.append('userid', user.id.toString());

    try {
      const response = await axios.post(`${BASE_URL}/detect/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
    } catch (error: any) {
      console.error(error);
      Alert.alert('Detection Error', 'Check server connectivity');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.loginContainer}>
        <Text style={styles.mainTitle}>Medical AI Portal</Text>
        <Text style={styles.subTitle}>Bone Abnormality Detection</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Username" 
          value={loginUser} 
          onChangeText={setLoginUser}
          autoCapitalize="none"
        />
        <TextInput 
          style={styles.input} 
          placeholder="Password" 
          value={loginPass} 
          onChangeText={setLoginPass} 
          secureTextEntry 
        />
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <Text style={styles.footerNote}>Connected to: {SERVER_IP}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.welcome}>Dr. {user.username}</Text>
          <TouchableOpacity onPress={() => setUser(null)}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Diagnostic Scan</Text>
          <View style={styles.uploadArea}>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.previewImage} />
            ) : (
              <Text style={styles.placeholderText}>No X-ray Loaded</Text>
            )}
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
            <Text style={styles.buttonText}>Select X-ray</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.detectButton, (!image || loading) && styles.disabledButton]} 
            onPress={runDetection}
            disabled={loading || !image}
          >
            <Text style={styles.buttonText}>{loading ? 'Analyzing...' : 'Run AI Detection'}</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color="#1A237E" style={{ marginTop: 20 }} />}

        {result && (
          <View style={styles.resultCard}>
            <View style={[styles.findingBadge, { backgroundColor: result.finding === 'Abnormal' ? '#FFEBEE' : '#E8F5E9' }]}>
              <Text style={[styles.findingText, { color: result.finding === 'Abnormal' ? '#C62828' : '#2E7D32' }]}>
                {result.finding}
              </Text>
            </View>
            <Text style={styles.categoryText}>{result.category}</Text>
            <Text style={styles.confidenceText}>AI Confidence: {(result.confidence * 100).toFixed(1)}%</Text>
            <Image source={{ uri: result.image_url }} style={styles.resultImage} resizeMode="contain" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f7fa' },
  scrollContent: { padding: 20 },
  loginContainer: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#fff' },
  mainTitle: { fontSize: 28, fontWeight: 'bold', color: '#1A237E', textAlign: 'center' },
  subTitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: '#f1f3f5', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
  loginButton: { backgroundColor: '#1A237E', padding: 15, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footerNote: { textAlign: 'center', marginTop: 20, color: '#aaa', fontSize: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  welcome: { fontSize: 18, fontWeight: '600', color: '#333' },
  logoutText: { color: '#C62828', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#1A237E' },
  uploadArea: { width: '100%', height: 250, backgroundColor: '#f8f9fa', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#dee2e6', borderStyle: 'dashed' },
  placeholderText: { color: '#adb5bd' },
  previewImage: { width: '100%', height: '100%', borderRadius: 12 },
  actionButton: { backgroundColor: '#2196F3', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  detectButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center' },
  disabledButton: { backgroundColor: '#a5d6a7' },
  resultCard: { marginTop: 25, backgroundColor: '#fff', padding: 20, borderRadius: 15, elevation: 5 },
  findingBadge: { padding: 8, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 10 },
  findingText: { fontWeight: 'bold', fontSize: 16 },
  categoryText: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  confidenceText: { fontSize: 14, color: '#666', marginBottom: 15 },
  resultImage: { width: '100%', height: 300, borderRadius: 10 },
});
