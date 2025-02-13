import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, StyleSheet, Alert, TouchableOpacity 
} from "react-native";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = "https://appointmentbookingsystem-kvdr.onrender.com/api/appointments"; // Backend API URL

const BookedAppointmentsScreen = ({ route, navigation }) => {
  const { token } = route.params; // Get the token from navigation
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Fetch user appointments whenever the page is focused
  useFocusEffect(
    React.useCallback(() => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setUser(decoded);
          fetchUserAppointments(decoded.email); // Fetch appointments
        } catch (error) {
          console.error("Failed to decode token", error);
          Alert.alert("Error", "Invalid or expired token.");
          navigation.navigate("Login");
          return;
        }
      }
    }, [token]) // Re-run if token changes
  );

  // Fetch booked appointments for the logged-in user
  const fetchUserAppointments = async (email) => {
    setLoading(true); // Start loading before fetching
    try {
      const response = await axios.get(`${API_URL}/user/${email}`);
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      Alert.alert("Error", "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateForBackend = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const cancelAppointment = async (appointmentId, date, startTime) => {
    // Show confirmation alert before canceling
    Alert.alert(
      "Confirm Cancellation",
      "Are you sure you want to cancel this appointment?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          onPress: async () => {
            try {
              const formattedDate = formatDateForBackend(date); // Format date properly before sending
              await axios.delete(`${API_URL}/cancel/${appointmentId}`, {
                data: { date: formattedDate, start_time: startTime },
              });

              // Remove the canceled appointment from the state
              setAppointments((prev) => prev.filter((appt) => appt.id !== appointmentId));

              Alert.alert("Success", "Your appointment has been canceled.");
            } catch (error) {
              console.error("Error canceling appointment:", error);
              Alert.alert("Error", "Failed to cancel appointment.");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  if (!user) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 My Booked Appointments</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
      ) : appointments.length === 0 ? (
        <Text style={styles.noAppointments}>No booked appointments</Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.appointmentCard}>
              <Text style={styles.date}> Date: {new Date(item.date).toLocaleDateString()}</Text>
              <Text style={styles.time}>
                Time: {item.start_time} - {item.end_time}
              </Text>
              <Text style={styles.detail}>Phone: {item.phone}</Text>
              <Text style={styles.detail}>NIC: {item.nic}</Text>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => cancelAppointment(item.id, item.date, item.start_time)}
              >
                <Text style={styles.cancelText}>Cancel Booking</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f0defa" },
  title: { 
    fontSize: 22, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: 15, 
    color: "#333",
    marginTop: 24,
  },
  noAppointments: { textAlign: "center", fontSize: 16, color: "gray", marginTop: 20 },
  appointmentCard: { 
    backgroundColor: "#fff", 
    padding: 15, 
    borderRadius: 10, 
    marginVertical: 8, 
    elevation: 3, 
    shadowColor: "#000", 
    shadowOpacity: 0.2, 
    shadowRadius: 5, 
    shadowOffset: { width: 0, height: 2 },
  },
  date: { fontSize: 18, fontWeight: "bold", color: "#333" },
  time: { fontSize: 16, color: "#555", marginBottom: 5 },
  detail: { fontSize: 14, color: "#666" },
  cancelButton: { 
    backgroundColor: "#ff4444", 
    padding: 10, 
    borderRadius: 5, 
    marginTop: 10,
    alignItems: "center",
  },
  cancelText: { color: "#fff", fontWeight: "bold" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default BookedAppointmentsScreen;
