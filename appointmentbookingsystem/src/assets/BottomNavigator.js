import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Ensure expo/vector-icons is installed
import AvailableSlotsScreen from '../screens/AvailableSlotsScreen';
import BookedAppointmentsScreen from '../screens/BookedAppointmentsScreen';
import AddAppointmentSlotScreen from '../screens/AddAppointmentSlot';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = ({ route }) => {
  const { token } = route.params; // Get token from navigation params

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0,
          elevation: 5, // Adds a shadow effect
          height: 60, // Adjusts the height of the tab bar
        },
        tabBarActiveTintColor: '#a164cf', // Active tab color
        tabBarInactiveTintColor: '#7a7a7a', // Inactive tab color
        tabBarLabelStyle: {
          fontSize: 14,
          marginBottom: 5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'GetSlots':
              iconName = focused ? 'grid' : 'grid-outline';
              break;

            case 'Appointments':
              iconName = focused ? 'document' : 'document-outline';
              break;


          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="GetSlots" 
        component={AvailableSlotsScreen}
        initialParams={{ token }} // Pass the token to AvailableSlotsScreen
        options={{ headerShown: false }} 
      />


      <Tab.Screen 
        name="Appointments" 
        component={BookedAppointmentsScreen}
        initialParams={{ token }} // Pass the token to AvailableSlotsScreen
        options={{ headerShown: false }} 
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
