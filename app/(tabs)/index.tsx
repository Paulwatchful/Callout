import React, { useEffect, useState, useLayoutEffect } from 'react';
import { StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useNavigation } from 'expo-router';
import { setupDatabase, saveStatus, getLatestStatus } from '@src/database';
// Import react-native-mobile-sms for direct SMS sending on Android
import mobileSms from 'react-native-mobile-sms';

export default function TabOneScreen() {
  const [status, setStatus] = useState<string>('Off Call');
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: status,
      headerStyle: { backgroundColor: status === 'On Call' ? 'green' : 'red' },
      headerTintColor: '#fff',
    });
  }, [navigation, status]);

  useEffect(() => {
    setupDatabase()
      .then(() => getLatestStatus())
      .then((latest: string | null) => {
        if (latest) {
          setStatus(latest);
        }
      })
      .catch((error: any) => {
        console.error('Error setting up database or fetching status:', error);
      });
  }, []);

  const toggleStatus = async () => {
    const newStatus = status === 'On Call' ? 'Off Call' : 'On Call';
    setStatus(newStatus);
    try {
      await saveStatus(newStatus);
      console.log('Status saved:', newStatus);

      // Prepare the SMS message: "8" for On Call, "9" for Off Call
      const message = newStatus === 'On Call' ? '8' : '9';
      
      // Check if the platform is Android before using react-native-mobile-sms
      if (Platform.OS === 'android') {
        mobileSms.sendDirectSms('07537415757', message)
        .then((response: any) => {
          console.log('SMS sent successfully:', response);
        })
        
          .catch((error: any) => {
            console.error('Error sending SMS:', error);
          });
      } else {
        console.log('Direct SMS sending is only supported on Android.');
      }
    } catch (error: any) {
      console.error('Error toggling status:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tab One</Text>
      <Text style={styles.status}>Current Status: {status}</Text>
      <TouchableOpacity style={styles.button} onPress={toggleStatus}>
        <Text style={styles.buttonText}>Toggle Status</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 18,
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#2f95dc',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
