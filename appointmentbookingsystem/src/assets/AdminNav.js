import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // Ensure expo/vector-icons is installed
import ManageSlotsScreen from '../screens/ManageSlotsScreen';
import AddAppointmentSlotScreen from '../screens/AddAppointmentSlot';
import AppointmentsScreen from '../screens/AppointmentScreen';

const Tab = createBottomTabNavigator();

const AdminNav = ({ route }) => {

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
            case 'AddSlot':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;

            case 'ManageSlots':
              iconName = focused ? 'create' : 'create-outline';
              break;

            case 'AllAppointments':
              iconName = focused ? 'document' : 'document-outline';
              break;

          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="ManageSlots" 
        component={ManageSlotsScreen}
        options={{ headerShown: false }} 
      />

      <Tab.Screen 
        name="AddSlot" 
        component={AddAppointmentSlotScreen}
        options={{ headerShown: false }} 
      />

      <Tab.Screen 
        name="AllAppointments" 
        component={AppointmentsScreen}
        options={{ headerShown: false }} 
      />


    </Tab.Navigator>
  );
};

export default AdminNav;
