import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FCM_TOKEN_KEY = 'fcm_push_token';

// How notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotifications = async (): Promise<string | null> => {
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permission denied');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('emergency', {
      name: 'Emergency Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF0000',
      sound: 'default',
      enableVibrate: true,
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  await AsyncStorage.setItem(FCM_TOKEN_KEY, token);
  return token;
};

export const getStoredPushToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(FCM_TOKEN_KEY);
};

export const addNotificationListener = (
  onNotification: (notification: Notifications.Notification) => void
) => {
  return Notifications.addNotificationReceivedListener(onNotification);
};

export const addNotificationResponseListener = (
  onResponse: (response: Notifications.NotificationResponse) => void
) => {
  return Notifications.addNotificationResponseReceivedListener(onResponse);
};

export const removeNotificationSubscription = (
  subscription: Notifications.EventSubscription
) => {
  subscription.remove();
};

export const sendLocalEmergencyNotification = async (title: string, body: string, data?: object) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data ?? {},
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: null, // fire immediately
  });
};
