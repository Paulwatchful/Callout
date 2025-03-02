import React, { useEffect, useState, useLayoutEffect } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import * as SMS from 'expo-sms';
import { useNavigation } from 'expo-router';
import { setupDatabase, saveStatus, getLatestStatus } from '@src/database';

export default function TabOneScreen() {
  const [status, setStatus] = useState<string>('Off Call');
  const navigation = useNavigation();

  // Update header title and style dynamically
  useLayoutEffect(() => {
    navigation.setOptions({
      title: status,
      headerStyle: { backgroundColor: status === 'On Call' ? 'green' : 'red' },
      headerTintColor: '#fff', // White text for header
    });
  }, [navigation, status]);

  useEffect(() => {
    // Initialize the database and fetch the latest status on mount.
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
    // Toggle status between "On Call" and "Off Call"
    const newStatus = status === 'On Call' ? 'Off Call' : 'On Call';
    setStatus(newStatus);
    try {
      await saveStatus(newStatus);
      console.log('Status saved:', newStatus);
      
      // Prepare the SMS message: "8" for On Call, "9" for Off Call
      const message = newStatus === 'On Call' ? '8' : '9';
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        const result = await SMS.sendSMSAsync(['07537415757'], message);
        console.log('SMS result:', result);
      } else {
        console.log('SMS is not available on this device.');
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
