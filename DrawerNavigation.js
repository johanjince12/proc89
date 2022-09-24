import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import StackNavigator from './StackNavigator';
import Profile from '../screens/Profile';
import Logout from '../screens/Logout'

const Drawer = createDrawerNavigator();

export default class DrawerNavigator extends React.Component {
  constructor(){
    super()
    this.state={
      light_theme:false
    }
  }
  componentDidMount(){
    let theme;
    firebase.database().ref("/users/"+firebase.auth().currentUser.uid).on("value", function (snapshot) {
      theme=snapshot.val().currentTheme
    });
    this.setState({ light_theme: theme === "light" ? true : false})
  }
  render(){
    let props=this.props
    return(
      <Drawer.Navigator 
        drawerContentOptions={{activeTintColor:"#e91e63",inactiveTintColor:this.state.light_theme ? "black" : "white", itemStyle:{marginVertical:5}}}
        drawerContent={props => <CustomSidebarMenu {...props} />}
      >
        <Drawer.Screen
          name="Home"
          component={StackNavigator}
          options={{unmountOnBlur: true}}
        />
        <Drawer.Screen
          name="Profile"
          component={Profile}
          options={{unmountOnBlur:true}}
        />
        <Drawer.Screen
          name="Logout"
          component={Logout}
          options={{unmountOnBlur:true}}
        />
      </Drawer.Navigator>
    )
  }
}