import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { jwtDecode } from 'jwt-decode';

const HomeScreen = ({ route, navigation }) => {
  const { token } = route.params; // Get the token passed from the Login screen

  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      try {
        // Decode the token to get the user information
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error("Failed to decode token", error);
        Alert.alert("Error", "Invalid or expired token.");
        navigation.navigate('Login'); // If decoding fails, go back to Login screen
      }
    }
  }, [token]);

  if (!user) {
    return <Text>Loading...</Text>; // Optionally show a loading screen until token is decoded
  }

  return (
    <View>
      <Text>Welcome, {user.name}!</Text>
      <Button
        title="Log Out"
        onPress={() => {
          // Handle logout here, clear token and navigate back to login
          navigation.navigate('Login');
        }}
      />
    </View>
  );
};

export default HomeScreen;
