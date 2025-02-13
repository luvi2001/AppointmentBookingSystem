import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, StyleSheet, Alert 
} from "react-native";
import axios from "axios";

const API_URL = "https://appointmentbookingsystem-kvdr.onrender.com/api/appointments/appointment-slots"; // Backend API URL

const AppointmentsScreen = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all appointment slots
  const fetchAppointments = async () => {
    try {
      const response = await axios.get(API_URL);
      setSlots(response.data.slots);
    } catch (error) {
      console.error("Error fetching appointment slots:", error);
      Alert.alert("Error", "Failed to fetch appointment slots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Appointments</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
      ) : slots.length === 0 ? (
        <Text style={styles.noSlots}>No appointment slots available</Text>
      ) : (
        <FlatList
          data={slots}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.slotCard}>
              <Text style={styles.date}>Date: {new Date(item.date).toLocaleDateString()}</Text>
              <Text style={styles.time}>Time: {item.start_time} - {item.end_time}</Text>
              <Text style={styles.label}><Text style={styles.bold}>Name:</Text> {item.name}</Text>
              <Text style={styles.label}><Text style={styles.bold}>Email:</Text> {item.email}</Text>
              <Text style={styles.label}><Text style={styles.bold}>Phone:</Text> {item.phone}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f0defa" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 15, color: "#333", marginTop: 20 },
  noSlots: { textAlign: "center", fontSize: 16, color: "gray", marginTop: 20 },
  slotCard: { 
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
  label: { fontSize: 16, color: "#444" },
  bold: { fontWeight: "bold" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default AppointmentsScreen;
