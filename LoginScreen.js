import React, {Component} from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Switch } from 'react-native';
import { AppLoading } from 'expo-app-loading'
import * as Font from 'expo-font'

export default class LoginScreen extends Component {
  constructor(){
    super()
    this.state={
      fontsLoaded:true,
      isEnabled:null,
      light_theme:false // we dont want to blind our customers
    }
  }
  signinWithGoogleAsync = async () => {
    try {
      const result = await Google.loginAsync({
        behavior:"web",
        androidClientID:'996183452238-fvllsdt75k2tjbvmokknvn8t9eciss5c.apps.googleusercontent.com',
        iosClientID:'996183452238-98qgj44r2semjt61fugkpj3bkrjb2tbq.apps.googleusercontent.com',
        scopes:['profile','email']
      })
      if (result.type === "success") {
        this.onSignIn(result);
        return result.accessToken;
      } else {
        return { cancelled: true };
      }
    } catch (e) {
      console.log(e.message);
      return { error: true };
    }
  }
  isUserEqual = (googleUser, firebaseUser) => {
    if (firebaseUser) {
      var providerData = firebaseUser.providerData;
      for (var i = 0; i < providerData.length; i++) {
        if (
          providerData[i].providerId ===
          firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
          providerData[i].uid === googleUser.getBasicProfile().getId()
        ) {
          // We don't need to reauth the Firebase connection.
          return true;
        }
      }
    }
    return false;
  };
  onSignIn = googleUser => {
    // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    var unsubscribe = firebase.auth().onAuthStateChanged(firebaseUser => {
      unsubscribe();
      // Check if we are already signed-in Firebase with the correct user.
      if (!this.isUserEqual(googleUser, firebaseUser)) {
        // Build Firebase credential with the Google ID token.
        var credential = firebase.auth.GoogleAuthProvider.credential(
          googleUser.idToken,
          googleUser.accessToken
        );

        // Sign in with credential from the Google user.
        firebase
          .auth()
          .signInWithCredential(credential)
          .then(function (result) {
            if (result.additionalUserInfo.isNewUser) {
              firebase
                .database()
                .ref("/users/" + result.user.uid)
                .set({
                  gmail: result.user.email,
                  profile_picture: result.additionalUserInfo.profile.picture,
                  locale: result.additionalUserInfo.profile.locale,
                  first_name: result.additionalUserInfo.profile.given_name,
                  last_name: result.additionalUserInfo.profile.family_name,
                  current_theme: "dark"
                })
                .then(function (snapshot) { });
            }
          })
          .catch(error => {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            // The email of the user's account used.
            var email = error.email;
            // The firebase.auth.AuthCredential type that was used.
            var credential = error.credential;
            // ...
          });
      } else {
        console.log("User already signed-in Firebase.");
      }
    });
  };
  toggleSwitch(){
    const previous_state=this.state.isEnabled
    const theme=!this.state.isEnabled? "dark" : "light"
    var updates = {}
    updates["/users/"+firebase.auth().currentUser.uid + "/current_theme"] = theme
    firebase.database().ref().update(updates);
    this.setState({isEnabled: !previous_state, light_theme: previous_state})
  }
  render() {
    if(this.state.fontsLoaded) {
      return <AppLoading/>
    } else {
      return (
        <View style={styles.container}>
          <SafeAreaView style={styles.droidSafeArea}/>
          <View style={styles.appTitle}>
            <Image source={require("../assets/logo.png")} style={styles.appIcon}></Image>
            <Text style={styles.appTitleText}>{`Spectagram\nApp`}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={()=>this.signinWithGoogleAsync()}>
              <Image source={require("../assets/google_icon.png")} style={styles.googleIcon}/>
              <Text style={styles.googleText}>Sign in with Google</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cloudContainer}>
            <Image source={require('../assets/cloud.png')} style={styles.cloudImage}></Image>
          </View>
          <View style={styles.buttonContainer}>
            <Switch onPress={this.toggleSwitch}></Switch>
            <Text style={styles.appText}>Dark/Light Mode</Text>
          </View>
        </View>
      );
    }
  }
}

styles=StyleSheet.create({
  container:{flex:1,justifyContent:"center",alignItems:"center"},
  droidSafeArea: {
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight : RFValue(35)
  },
})