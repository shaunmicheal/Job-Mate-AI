import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function JobDetailsScreen({ route }) {
  const [applied, setApplied] = useState(false);

  const job = route?.params?.job;

  if (!job) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>
          Job details not found
        </Text>

        <Text style={styles.errorText}>
          Please go back and select a job again.
        </Text>
      </View>
    );
  }

  const rawJob = job.raw || {};
  const rawDescription =
    rawJob.description ||
    rawJob.requirements ||
    rawJob.summary ||
    "This is a job opportunity. Review the listed requirements and prepare your application.";

  const descriptionText =
    typeof rawDescription === "string"
      ? rawDescription
      : typeof rawDescription === "object"
        ? rawDescription.text || JSON.stringify(rawDescription)
        : String(rawDescription);

  const cleanDescription = String(descriptionText)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

  const shortDescription = cleanDescription
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .slice(0, 3)
    .join(" ") || cleanDescription;

  const handleApply = () => {
    setApplied(true);
  };

  return (
    <View style={styles.container}>

      {/* Job Header */}
      <View style={styles.header}>
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
      </View>

      {/* Skills */}
      <View style={styles.section}>
        <Text style={styles.heading}>
          Required Skills
        </Text>

        <Text style={styles.skills}>
          {job.skills}
        </Text>
      </View>

      {/* About Job */}
      <View style={styles.section}>
        <Text style={styles.heading}>
          About this Job
        </Text>

        <Text style={styles.description}>
          {shortDescription}
        </Text>
      </View>

      {/* Apply Button */}
      <TouchableOpacity
        style={[
          styles.button,
          applied && styles.appliedButton,
        ]}
        onPress={handleApply}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>
          {applied
            ? "Application Submitted ✓"
            : "Apply Now"}
        </Text>
      </TouchableOpacity>

      {/* Success Message */}
      {applied && (
        <View style={styles.successBox}>
          <Text style={styles.successTitle}>
            Application Started 🎉
          </Text>

          <Text style={styles.successText}>
            Your application for {job.title} at{" "}
            {job.company} has been started successfully.
          </Text>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 24,
  },

  header: {
    marginBottom: 20,
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
    marginBottom: 18,
  },

  heading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  skills: {
    fontSize: 15,
    color: "#240be0",
    fontWeight: "600",
  },

  description: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
  },

  button: {
    backgroundColor: "#240be0",
    padding: 16,
    borderRadius: 12,
    marginTop: 5,
    alignItems: "center",
  },

  appliedButton: {
    backgroundColor: "#10B981",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  successBox: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#10B981",
    padding: 18,
    borderRadius: 15,
    marginTop: 18,
  },

  successTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#047857",
    marginBottom: 8,
  },

  successText: {
    fontSize: 15,
    color: "#065F46",
    lineHeight: 22,
  },

  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
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
    textAlign: "center",
  },
});