import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

export default function JobDetailsScreen({ route }) {
  const job = route?.params?.job;

  if (!job) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>
          Job details not found
        </Text>

        <Text style={styles.errorText}>
          Please go back and select a job again.
        </Text>
      </View>
    );
  }

  const handleApply = () => {
    Alert.alert(
      "Application Started",
      `You selected the ${job.title} position at ${job.company}.`
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>💼</Text>

      <Text style={styles.title}>
        {job.title}
      </Text>

      <Text style={styles.company}>
        {job.company}
      </Text>

      <Text style={styles.location}>
        📍 {job.location}
      </Text>

      <View style={styles.section}>
        <Text style={styles.heading}>
          Required Skills
        </Text>

        <Text style={styles.skills}>
          {job.skills}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>
          About this Job
        </Text>

        <Text style={styles.description}>
          This is a developer job opportunity.
          You can review the requirements and
          prepare your application.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleApply}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>
          Apply Now
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 24,
  },

  emoji: {
    fontSize: 45,
    marginBottom: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },

  company: {
    fontSize: 17,
    color: "#64748B",
    marginTop: 8,
  },

  location: {
    fontSize: 15,
    color: "#64748B",
    marginTop: 10,
  },

  section: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 15,
    marginTop: 20,
  },

  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  skills: {
    fontSize: 15,
    color: "#7C3AED",
    fontWeight: "600",
  },

  description: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
  },

  button: {
    backgroundColor: "#7C3AED",
    padding: 15,
    borderRadius: 12,
    marginTop: 25,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#EF4444",
  },

  errorText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 10,
  },
});