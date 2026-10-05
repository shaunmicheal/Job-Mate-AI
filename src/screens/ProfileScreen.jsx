import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>👤</Text>

      <Text style={styles.title}>My Profile</Text>

      <Text style={styles.text}>
        Manage your profile, CV and career information.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  emoji: {
    fontSize: 45,
    marginBottom: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
  },

  text: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});