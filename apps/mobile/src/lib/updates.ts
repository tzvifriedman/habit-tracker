import * as Updates from 'expo-updates';

// Called on every app foreground. Silently fetches and applies OTA updates.
export async function checkForUpdate(): Promise<void> {
  if (__DEV__) return;
  try {
    const result = await Updates.checkForUpdateAsync();
    if (result.isAvailable) {
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  } catch {
    // Network error or no update — safe to ignore
  }
}
