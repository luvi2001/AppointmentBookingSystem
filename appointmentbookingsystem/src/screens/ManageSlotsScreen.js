import React, { useState, useCallback } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, StyleSheet, 
  TouchableOpacity, Alert 
} from "react-native";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = "http://192.168.8.169:3000/api/appointments"; // Backend API URL

const ManageSlotsScreen = ({ navigation }) => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all appointment slots
  const fetchAppointmentSlots = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/available-slots`);
      setSlots(response.data.slots);
    } catch (error) {
      console.error("Error fetching appointment slots:", error);
      Alert.alert("Error", "Failed to fetch appointment slots.");
    } finally {
      setLoading(false);
    }
  };

  // Handle slot deletion with confirmation
  const deleteSlot = (slotId) => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this appointment slot?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await axios.delete(`${API_URL}/delete-slot/${slotId}`);
              Alert.alert("Success", response.data.message);
              fetchAppointmentSlots(); // Refresh slots
            } catch (error) {
              console.error("Error deleting slot:", error);
              Alert.alert("Error", "Failed to delete the slot.");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  // Refresh slots whenever screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchAppointmentSlots();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Appointment Slots</Text>

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
              <Text style={styles.date}> Date: {new Date(item.date).toLocaleDateString()}</Text>
              <Text style={styles.time}>Time: {item.start_time} - {item.end_time}</Text>
              <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={() => deleteSlot(item.id)}
              >
                <Text style={styles.deleteButtonText}>Delete Slot</Text>
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
  time: { fontSize: 16, color: "#555", marginBottom: 10 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  deleteButton: { 
    backgroundColor: "#dc3545", 
    padding: 10, 
    borderRadius: 5, 
    alignItems: "center", 
    marginTop: 10, 
  },
  deleteButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default ManageSlotsScreen;
