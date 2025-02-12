import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SignUpScreen from './src/screens/SignUpScreen';
import LoginScreen from './src/screens/LoginScreen';
import AddAppointmentSlotScreen from './src/screens/AddAppointmentSlot';
import AvailableSlotsScreen from './src/screens/AvailableSlotsScreen';
import BottomTabNavigator from './src/assets/BottomNavigator';
import BookedAppointmentsScreen from './src/screens/BookedAppointmentsScreen';
import AdminNav from './src/assets/AdminNav';
import AppointmentsScreen from './src/screens/AppointmentScreen';


const Stack = createStackNavigator();
export default function App() {
  return (
    <NavigationContainer>
    <Stack.Navigator initialRouteName="Login">
    {/* Define screens as part of the stack */}

    
    <Stack.Screen name="Signup" component={SignUpScreen} options={{ headerShown: false }}/>
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
    <Stack.Screen name="NavBar" component={BottomTabNavigator} options={{ headerShown: false }}/>
    <Stack.Screen name="AddSlot" component={AddAppointmentSlotScreen} options={{ headerShown: false }}/>
    <Stack.Screen name="GetSlots" component={AvailableSlotsScreen} options={{ headerShown: false }}/>
    <Stack.Screen name="Appointments" component={BookedAppointmentsScreen} options={{ headerShown: false }}/>
    <Stack.Screen name="AdminNav" component={AdminNav} options={{ headerShown: false }}/>
    <Stack.Screen name="AllAppointments" component={AppointmentsScreen} options={{ headerShown: false }}/>


  </Stack.Navigator>
</NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
