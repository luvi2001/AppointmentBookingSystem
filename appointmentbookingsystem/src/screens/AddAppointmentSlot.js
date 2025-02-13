import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Alert, Platform 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// Helper function to format time in local timezone
const formatTimeToLocal = (time) => {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const formattedTime = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
  return formattedTime;
};

const AddAppointmentSlotScreen = () => {
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Handle Date Selection
  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      const today = new Date();
      if (selectedDate < today.setHours(0, 0, 0, 0)) {
        Alert.alert("Invalid Date", "Please select a future date.");
      } else {
        setDate(selectedDate);
      }
    }
    setShowDatePicker(false);
  };

  // Handle Start Time Selection
  const handleStartTimeChange = (event, selectedTime) => {
    if (!selectedTime) return;
  
    const now = new Date();
  
    // Get current date (YYYY-MM-DD) with no time
    const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
    // Get selected date (YYYY-MM-DD) with no time
    const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
    if (selectedDate.getTime() === currentDate.getTime()) {
      // If the selected date is today, check that the time is in the future
      if (selectedTime < now) {
        Alert.alert("Invalid Time", "Start time must be in the future.");
        return;
      }
    }
  
    // If the date is in the future, any time is valid
    setStartTime(selectedTime);
    setShowStartTimePicker(false);
  };
  

  // Handle End Time Selection
  const handleEndTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      if (selectedTime <= startTime) {
        Alert.alert("Invalid Time", "End time must be after start time.");
      } else {
        setEndTime(selectedTime);
      }
    }
    setShowEndTimePicker(false);
  };

  // Handle Appointment Slot Creation
  const handleCreateSlot = async () => {
    // Format the date and times to the local timezone
    const slotData = {
      date: date.toISOString().split('T')[0], // Date in YYYY-MM-DD format
      start_time: formatTimeToLocal(startTime), // Local start time in HH:mm format
      end_time: formatTimeToLocal(endTime), // Local end time in HH:mm format
    };

    try {
      const response = await fetch('https://appointmentbookingsystem-kvdr.onrender.com/api/appointments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slotData),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Error', data.message || 'Failed to create appointment slot.');
        return;
      }

      Alert.alert('Success', 'Appointment slot created successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to the server.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Appointment Slot</Text>

      {/* Date Picker */}
      <Text style={styles.label}>Date:</Text>
      <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
        <Text>{date.toISOString().split('T')[0]}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleDateChange}
          minimumDate={new Date()} // Restricts past dates
        />
      )}

      {/* Start Time Picker */}
      <Text style={styles.label}>Start Time:</Text>
      <TouchableOpacity style={styles.dateInput} onPress={() => setShowStartTimePicker(true)}>
        <Text>{formatTimeToLocal(startTime)}</Text>
      </TouchableOpacity>
      {showStartTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleStartTimeChange}
        />
      )}
      
      {/* End Time Picker */}
      <Text style={styles.label}>End Time:</Text>
      <TouchableOpacity style={styles.dateInput} onPress={() => setShowEndTimePicker(true)}>
        <Text>{formatTimeToLocal(endTime)}</Text>
      </TouchableOpacity>
      {showEndTimePicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={handleEndTimeChange}
        />
      )}

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleCreateSlot}>
        <Text style={styles.buttonText}>Create Slot</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 25, 
    justifyContent: 'center', 
    backgroundColor: '#f0defa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    width: '100%',
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#a164cf',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff', 
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddAppointmentSlotScreen;
