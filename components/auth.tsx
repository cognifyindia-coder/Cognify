import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';

export default function() {
  GoogleSignin.configure({
  webClientId: '954533363910-i04rkv218ro33l80if7prsc3s4288ajt.apps.googleusercontent.com', // client ID of type WEB for your server. Required to get the `idToken` on the user object, and for offline access.
  scopes: [
    /* what APIs you want to access on behalf of the user, default is email and profile
    this is just an example, most likely you don't need this option at all! */
    'https://www.googleapis.com/auth/drive.readonly'],
});

return(
  <GoogleSigninButton
    size={GoogleSigninButton.Size.Wide}
    color={GoogleSigninButton.Color.Dark}
    onPress={async () => {
      try {
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();
        console.log(JSON.stringify(response.user, null, 2));
      } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          console.log('User cancelled signin');
        } else if (error.code === statusCodes.IN_PROGRESS) {
          console.log('Signin in progress');
        } else {
          console.log('Something went wrong', error);
        }
      }
    }}
  />
);
}