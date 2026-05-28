import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

const EAS_PROJECT_ID = 'fe1f3dd3-549d-4015-9a31-0b1839e6bba6';

// Called once at app startup — controls how notifications appear when the app is foregrounded
export function setupNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// Called after sign-in. Requests permission, gets the Expo push token, saves it to devices table.
export async function registerForPushNotifications(userId: string): Promise<void> {
  if (Platform.OS === 'web') return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return;

  let token: string;
  try {
    const result = await Notifications.getExpoPushTokenAsync({ projectId: EAS_PROJECT_ID });
    token = result.data;
  } catch {
    // Simulator or misconfigured project — skip silently
    return;
  }

  await supabase.from('devices').upsert(
    {
      user_id: userId,
      fcm_token: token,
      platform: Platform.OS as 'ios' | 'android',
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,fcm_token' },
  );
}
