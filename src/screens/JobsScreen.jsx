import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

const jobs = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Tech Company",
    location: "Harare",
    skills: "React • JavaScript • Git",
  },
  {
    id: 2,
    title: "Backend Developer",
    company: "Software Solutions",
    location: "Harare",
    skills: "Node.js • Express • PostgreSQL",
  },
  {
    id: 3,
    title: "Full Stack Developer",
    company: "Digital Agency",
    location: "Remote",
    skills: "React • Node.js • SQL",
  },
];

export default function JobsScreen({ navigation }) {
  const [search, setSearch] = useState("");

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Jobs 💼</Text>

        <Text style={styles.subtitle}>
          Find opportunities that match your skills.
        </Text>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search jobs..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.jobs}>
        {filteredJobs.map((job) => (
          <View key={job.id} style={styles.jobCard}>
            <Text style={styles.jobEmoji}>💻</Text>

            <Text style={styles.jobTitle}>{job.title}</Text>

            <Text style={styles.company}>{job.company}</Text>

            <Text style={styles.location}>
              📍 {job.location}
            </Text>

            <Text style={styles.skills}>
              {job.skills}
            </Text>

          <TouchableOpacity
  style={styles.button}
  onPress={() => navigation.navigate("JobDetails", { job })}
>
  <Text style={styles.buttonText}>
    View Job
  </Text>
</TouchableOpacity>
          </View>
        ))}

        {filteredJobs.length === 0 && (
          <Text style={styles.noJobs}>
            No jobs found.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: "#64748B",
  },

  search: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
  },

  jobs: {
    padding: 20,
  },

  jobCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  jobEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },

  jobTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
  },

  company: {
    marginTop: 5,
    fontSize: 14,
    color: "#64748B",
  },

  location: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748B",
  },

  skills: {
    marginTop: 8,
    fontSize: 13,
    color: "#240be0",
    fontWeight: "600",
  },

  button: {
    backgroundColor: "#240be0",
    padding: 12,
    borderRadius: 12,
    marginTop: 15,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  noJobs: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 16,
    color: "#64748B",
  },
});