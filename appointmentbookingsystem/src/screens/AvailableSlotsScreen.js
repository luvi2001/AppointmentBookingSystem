import React, { useEffect, useState } from "react";
import { 
  View, Text, FlatList, ActivityIndicator, StyleSheet, 
  TextInput, Button, Modal, Alert, TouchableOpacity 
} from "react-native";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useFocusEffect } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const API_URL = "https://appointmentbookingsystem-kvdr.onrender.com/api/appointments"; // Backend API URL

const AvailableSlotsScreen = ({ route, navigation }) => {
  const { token } = route.params; // Get the token from navigation
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Default to current month

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error("Failed to decode token", error);
        Alert.alert("Error", "Invalid or expired token.");
        navigation.navigate("Login");
        return;
      }
    }
    fetchAvailableSlots();
  }, [token]);

  // Fetch available slots
  const fetchAvailableSlots = async () => {
    try {
      const response = await axios.get(`${API_URL}/available-slots`);

      // Get current date and time using the system's local time
      const currentDate = new Date();
      const currentDateString = currentDate.toLocaleDateString('en-CA'); // 'en-CA' gives YYYY-MM-DD format
      const currentTimeString = currentDate.toTimeString().split(' ')[0]; // HH:mm:ss

      // Filter out past slots by comparing both date and time separately
      const futureSlots = response.data.slots.filter((slot) => {
        const slotDate = slot.date;
        const slotStartTime = slot.start_time;

        // Compare both date and time
        if (slotDate > currentDateString) {
          return true; // Slot is in the future date-wise
        } else if (slotDate === currentDateString) {
          // If the date is the same, compare the times
          return slotStartTime > currentTimeString; // Slot time is in the future
        }

        return false; // Slot is in the past (both date and time)
      });

      // Filter slots by selected month
      const filteredSlots = futureSlots.filter((slot) => {
        const slotMonth = new Date(slot.date).getMonth() + 1; // Get month (1-12)
        return slotMonth === selectedMonth;
      });

      setSlots(filteredSlots);
    } catch (error) {
      console.error("Error fetching slots:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch slots again when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      fetchAvailableSlots();
    }, [selectedMonth]) // Refetch slots when month changes
  );

  const convertToUTC = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  
  // Handle slot booking
  const bookSlot = async () => {
    if (!user) return;
    try {
      const appointmentData = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        nic: user.nic,
        date: convertToUTC(selectedSlot.date),  
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
      };
  
      const response = await axios.post(`${API_URL}/book`, appointmentData);
  
      // Update the slot status to "booked"
      await axios.put(`${API_URL}/update-slot/${selectedSlot.id}`, { status: "booked" });
  
      Alert.alert("Success", response.data.message);
      setModalVisible(false);
      fetchAvailableSlots(); // Refresh slots
    } catch (error) {
      console.error("Error booking appointment:", error);
      Alert.alert("Error", "Failed to book the appointment.");
    }
  };
  

  if (!user) {
    return <Text>Loading...</Text>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Available Appointment Slots</Text>

      {/* Month Filter */}
      <View style={styles.monthFilterContainer}>
        <Text style={styles.monthLabel}>Select Month:</Text>
        <Picker
             selectedValue={selectedMonth}
             onValueChange={(itemValue) => setSelectedMonth(itemValue)}
             style={styles.picker}
        >
          {months.map((month, index) => (
    <Picker.Item key={index} label={month} value={index + 1} />
  ))}
</Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
      ) : slots.length === 0 ? (
        <Text style={styles.noSlots}>No available slots for the selected month</Text>
      ) : (
        <FlatList
          data={slots}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.slotCard}>
              <Text style={styles.date}> Date: {new Date(item.date).toLocaleDateString()}</Text>
              <Text style={styles.time}>Time: {item.start_time} - {item.end_time}</Text>
              <TouchableOpacity 
                style={styles.bookButton} 
                onPress={() => { setSelectedSlot(item); setModalVisible(true); }}
              >
                <Text style={styles.bookButtonText}>Book Slot</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Booking Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Book Appointment</Text>
            <TextInput style={styles.input} value={user.name} editable={false} />
            <TextInput style={styles.input} value={user.email} editable={false} />
            <TextInput style={styles.input} value={user.phone} editable={false} />
            <TextInput style={styles.input} value={user.nic} editable={false} />
            <TextInput style={styles.input} value={formatDate(selectedSlot?.date)} editable={false} />

            <TextInput 
              style={styles.input} 
              value={`${selectedSlot?.start_time} - ${selectedSlot?.end_time}`} 
              editable={false} 
            />
            <TouchableOpacity style={styles.confirmButton} onPress={bookSlot}>
              <Text style={styles.confirmButtonText}>Confirm Booking</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginTop:24,
  },
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

  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContainer: { 
    width: "90%", 
    padding: 20, 
    backgroundColor: "#fff", 
    borderRadius: 10, 
    shadowColor: "#000", 
    shadowOpacity: 0.3, 
    shadowRadius: 5, 
    shadowOffset: { width: 0, height: 3 },
    elevation: 5, 
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, textAlign: "center", color: "#a164cf" },
  input: { 
    borderWidth: 1, 
    padding: 10, 
    marginVertical: 5, 
    borderRadius: 5, 
    backgroundColor: "#f8f8f8", 
    borderColor: "#ddd", 
  },
  
  // Buttons
  bookButton: { 
    backgroundColor: "#a164cf", 
    padding: 10, 
    borderRadius: 5, 
    alignItems: "center", 
    marginTop: 10, 
  },
  bookButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  confirmButton: { 
    backgroundColor: "#a164cf", 
    padding: 12, 
    borderRadius: 5, 
    alignItems: "center", 
    marginTop: 10, 
  },
  confirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  cancelButton: { 
    backgroundColor: "#dc3545", 
    padding: 12, 
    borderRadius: 5, 
    alignItems: "center", 
    marginTop: 10, 
  },
  cancelButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  // Month Filter
  monthFilterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginTop:25
  },
  picker: {
    width: 150,
    height: 70,
    marginBottom:15
  },
});

export default AvailableSlotsScreen;
