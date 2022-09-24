import React, { Component } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, FlatList, SafeAreaView, Platform, StatusBar } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import PostCard from './PostCard'

export default class Feed extends Component {
  constructor(){
    super()
    this.state={
      posts:''
    }
  }
  fetchPosts = () => {
    firebase
      .database()
      .ref("/posts/")
      .on(
        "value",
        snapshot => {
          let stories = [];
          if (snapshot.val()) {
            Object.keys(snapshot.val()).forEach(function (key) {
              stories.push({
                key: key,
                value: snapshot.val()[key]
              });
            });
          }
          this.setState({ stories: stories });
          this.props.setUpdateToFalse();
        },
        function (errorObject) {
          console.log("The read failed: " + errorObject.code);
        }
      );
  };
  renderItem = ({item:post}) =>{
    return <PostCard post={post} navigation={this.props.navigation}/>
  }
  keyExtractor = (item, index) => index.toString();
  render(){
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.droidSafeArea} />
        <View style={styles.appTitle}>
          <View style={styles.appIcon}>
            <Image source={require('../assets/logo.png')} style={styles.iconImage}></Image>
          </View>
          <View style={styles.appTitleTextContainer}>
            <Text style={styles.appTitleText}>Spectagram</Text>
          </View>
        </View>
        <View style={styles.cardContainer}>
          <FlatList keyExtractor={this.keyExtractor} data={posts} renderItem={this.renderItem}/>
        </View>
      </View>
    )
  }
}

const styles=StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'black'
  },
  droidSafeArea:{
    marginTop: Platform.OS === "android" ? StatusBar.currentHeight: RFValue(13)
  },
  appIcon:{
    flex:0.07,
    flexDirection:"row"
  },
  appIcon:{
    flex:0.2,
    justifyContent:"center",
    alignItems:"center"
  },
  iconImage:{
    width:"100%",
    height:"100%",
    resizeMode:"contain",
  },
  appTitleTextContainer:{
    flex:0.8,
    justifyContent:"center"
  },
  appTitleText:{
    color:"white",
    fontSize:RFValue(28)
  },
  cardContainer:{
    flex:0.85
  }
})