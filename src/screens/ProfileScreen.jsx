import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

export default function ProfileScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>👤</Text>

        <Text style={styles.title}>
          My Profile
        </Text>

        <Text style={styles.subtitle}>
          Add your career information.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>
          Full Name
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>
          Email
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>
          Job Title
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Full Stack Developer"
          value={jobTitle}
          onChangeText={setJobTitle}
        />

        <Text style={styles.label}>
          Skills
        </Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. React, Node.js, PostgreSQL"
          value={skills}
          onChangeText={setSkills}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>
            Save Profile
          </Text>
        </TouchableOpacity>
      </View>

      {saved && (
        <View style={styles.successBox}>
          <Text style={styles.successTitle}>
            Profile Saved ✓
          </Text>

          <Text style={styles.profileName}>
            {name || "Your Name"}
          </Text>

          <Text style={styles.profileJob}>
            {jobTitle || "Your Job Title"}
          </Text>

          <Text style={styles.profileEmail}>
            {email || "Your Email"}
          </Text>

          <Text style={styles.profileSkills}>
            Skills: {skills || "No skills added"}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    alignItems: "center",
    padding: 24,
  },

  emoji: {
    fontSize: 50,
    marginBottom: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: "#64748B",
  },

  card: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },

  button: {
    backgroundColor: "#240be0",
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  successBox: {
    backgroundColor: "#EAF1FF",
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 18,
  },

  successTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1D4ED8",
    marginBottom: 15,
  },

  profileName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  profileJob: {
    fontSize: 16,
    color: "#1D4ED8",
    marginTop: 5,
  },

  profileEmail: {
    fontSize: 15,
    color: "#64748B",
    marginTop: 5,
  },

  profileSkills: {
    fontSize: 15,
    color: "#374151",
    marginTop: 12,
  },
});