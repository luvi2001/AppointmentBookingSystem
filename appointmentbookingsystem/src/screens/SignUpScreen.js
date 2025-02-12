import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nic, setNic] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rePassword, setRePassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (password !== rePassword) {
      setError('Passwords do not match');
      return;
    }

    const userData = { name, email, nic, phone, password };

    try {
      const response = await fetch('http://192.168.8.169:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (data.message === "User registered successfully") {
        alert('Sign Up Successful');
        navigation.navigate('Login'); // Assuming you have a 'Login' screen
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (error) {
      setError('Failed to connect to the server');
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image source={require('../assets/bck.jpg')} style={styles.backgroundImage} />
      
      <Text style={styles.title}>Sign Up</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      <TextInput 
        style={styles.input} 
        placeholder="Full Name" 
        value={name} 
        onChangeText={setName} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Email Address" 
        value={email} 
        onChangeText={setEmail} 
        keyboardType="email-address"
      />
      <TextInput 
        style={styles.input} 
        placeholder="National ID / NIC" 
        value={nic} 
        onChangeText={setNic} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Phone Number" 
        value={phone} 
        onChangeText={setPhone} 
        keyboardType="phone-pad"
      />
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        secureTextEntry 
        value={password} 
        onChangeText={setPassword} 
      />
      <TextInput 
        style={styles.input} 
        placeholder="Re-enter Password" 
        secureTextEntry 
        value={rePassword} 
        onChangeText={setRePassword} 
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 25, 
    justifyContent: 'center', 
    position: 'relative', // Make the background image take full screen
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject, // Positioning to cover the screen
    width: '200%',
    height: '200%',
    resizeMode: 'cover',
    opacity: 0.4, // Adjust opacity to blend background better with content
    zIndex: -1, // Make sure the image is behind the content
  },
  title: { 
    fontSize: 30, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 30,
    color: '#4B0082', // Elegant dark purple color
    zIndex: 1, // Make sure text is above the image
  },
  input: { 
    height: 50, 
    borderColor: '#a164cf', 
    borderWidth: 1, 
    marginBottom: 15, 
    paddingLeft: 15, 
    borderRadius: 8, // Rounded corners for input fields
    backgroundColor: '#fff', // Clean white background for input fields
    fontSize: 16,
    fontFamily: 'Arial',
    zIndex: 1, // Ensure input is above background
  },
  error: { 
    color: '#d9534f', // Bootstrap red for errors
    marginBottom: 15, 
    textAlign: 'center', 
    fontSize: 14 
  },
  button: {
    backgroundColor: '#a164cf', // Purple background for button
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000', // Shadow for button
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, // For Android elevation effect
  },
  buttonText: {
    color: '#fff', // White text color
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: { 
    marginTop: 20, 
    textAlign: 'center', 
    color: '#007bff', 
    fontSize: 16,
    textDecorationLine: 'underline' 
  },
});

export default SignUpScreen;
