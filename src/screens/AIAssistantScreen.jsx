import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { askJobMateAI } from "../services/aiApi";

const quickPrompts = [
  "How can I improve my CV for this role?",
  "What should I say in my interview introduction?",
  "How do I tailor my application to a job description?",
];

export default function AIAssistantScreen() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAskAI = async () => {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setAnswer("");
      setError("Please type a question first.");
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const response = await askJobMateAI(trimmedQuestion);
      setAnswer(response);
    } catch (err) {
      setError(err.message || "Something went wrong while contacting the AI service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.emoji}>✨</Text>
        <Text style={styles.title}>AI Career Assistant</Text>
        <Text style={styles.subtitle}>
          Get tailored advice on your CV, interviews, and job search.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Ask me anything</Text>

        <View style={styles.promptRow}>
          {quickPrompts.map((prompt) => (
            <TouchableOpacity
              key={prompt}
              style={styles.promptChip}
              onPress={() => setQuestion(prompt)}
              activeOpacity={0.8}
            >
              <Text style={styles.promptChipText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="e.g. How can I improve my CV?"
          value={question}
          onChangeText={setQuestion}
          multiline
          placeholderTextColor="#94A3B8"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAskAI}
          disabled={loading}
          activeOpacity={0.9}
        >
          {loading ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.buttonText}>Thinking...</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>Ask AI ✨</Text>
          )}
        </TouchableOpacity>
      </View>

      {error !== "" && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {answer !== "" && (
        <View style={styles.answerCard}>
          <Text style={styles.answerTitle}>AI Assistant</Text>
          <Text style={styles.answer}>{answer}</Text>
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

  content: {
    paddingBottom: 32,
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 16,
    alignItems: "center",
  },

  emoji: {
    fontSize: 48,
    marginBottom: 10,
  },

  title: {
    fontSize: 29,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },

  subtitle: {
    fontSize: 15,
    color: "#64748B",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginTop: 8,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },

  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },

  promptRow: {
    marginBottom: 12,
    gap: 8,
  },

  promptChip: {
    backgroundColor: "#E0EAFF",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#C7D7FF",
  },

  promptChipText: {
    color: "#1D4ED8",
    fontSize: 12,
    fontWeight: "600",
  },

  input: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    textAlignVertical: "top",
    backgroundColor: "#F8FAFC",
    color: "#111827",
  },

  button: {
    backgroundColor: "#240be0",
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonDisabled: {
    opacity: 0.75,
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  errorCard: {
    backgroundColor: "#FEE2E2",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
  },

  errorText: {
    color: "#B91C1C",
    fontSize: 14,
    lineHeight: 20,
  },

  answerCard: {
    backgroundColor: "#EAF1FF",
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 30,
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#CFE1FF",
  },

  answerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1D4ED8",
    marginBottom: 10,
  },

  answer: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
});