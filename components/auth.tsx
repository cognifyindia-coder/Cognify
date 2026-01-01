import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import { supabase } from '../supabase/utils/supabase';

export default function Auth({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
  GoogleSignin.configure({
    webClientId: '954533363910-ig67fb829qqm4tvpmcgbu9bd86pc0c2g.apps.googleusercontent.com',
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });

  return (
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Wide}
      color={GoogleSigninButton.Color.Dark}
      onPress={async () => {
        try {
          await GoogleSignin.hasPlayServices();
          const userInfo = await GoogleSignin.signIn();
          console.log(JSON.stringify(userInfo, null, 2));
          if ((userInfo as any)?.data?.idToken) {
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: (userInfo as any).data.idToken,
            });
            if (error) {
              console.log('Supabase error:', error);
            } else {
              console.log('Signed in:', data);
              onLoginSuccess?.();
            }
          } else {
            console.log('No idToken in response');
          }
        } catch (error: any) {
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            console.log('User cancelled login');
          } else if (error.code === statusCodes.IN_PROGRESS) {
            console.log('Sign in in progress');
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            console.log('Play services not available');
          } else {
            console.log('Some other error happened', error);
          }
        }
      }}
    />
  );
}

