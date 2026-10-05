import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import colors from "../styles/colors";
import spacing from "../styles/spacing";

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>👋 Hello!</Text>

        <Text style={styles.title}>
          Find your next{"\n"}
          career opportunity.
        </Text>

        <Text style={styles.subtitle}>
          Search jobs, improve your CV and prepare for interviews with AI.
        </Text>
      </View>

      <View style={styles.aiCard}>
        <View style={styles.aiTopRow}>
          <Text style={styles.aiEmoji}>✨</Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Smart match</Text>
          </View>
        </View>

        <Text style={styles.aiTitle}>AI Career Assistant</Text>

        <Text style={styles.aiText}>
          Analyze jobs, improve your CV and prepare for interviews with tailored guidance.
        </Text>

        <TouchableOpacity
          style={styles.aiButton}
          onPress={() => navigation.navigate("AI")}
          activeOpacity={0.9}
        >
          <Text style={styles.aiButtonText}>Start with AI →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended Jobs</Text>

        <TouchableOpacity
          style={styles.jobCard}
          onPress={() => navigation.navigate("Jobs")}
          activeOpacity={0.9}
        >
          <Text style={styles.jobEmoji}>💻</Text>

          <View style={styles.jobInfo}>
            <Text style={styles.jobTitle}>Frontend Developer</Text>
            <Text style={styles.company}>Tech Company</Text>
            <Text style={styles.location}>📍 Harare</Text>
            <Text style={styles.skills}>React • JavaScript • Git</Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4FF",
  },

  content: {
    paddingBottom: spacing.xl,
  },

  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },

  greeting: {
    fontSize: 16,
    color: "#5B6477",
    marginBottom: spacing.sm,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#111827",
    lineHeight: 42,
    letterSpacing: -0.8,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: "#5E6A7A",
    marginTop: spacing.sm,
    maxWidth: 320,
  },

  aiCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: "#240be0",
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    shadowColor: "#240be0",
    shadowOpacity: 0.22,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },

  aiTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  aiEmoji: {
    fontSize: 32,
  },

  pill: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  pillText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  aiTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.white,
    marginTop: spacing.md,
  },

  aiText: {
    fontSize: 14,
    lineHeight: 22,
    color: "rgba(255,255,255,0.82)",
    marginTop: spacing.sm,
  },

  aiButton: {
    alignSelf: "flex-start",
    backgroundColor: "#240be0",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 14,
    marginTop: spacing.md,
    shadowColor: "#240be0",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },

  aiButtonText: {
    color: colors.white,
    fontWeight: "800",
  },

  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },

  jobCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#E8EAF7",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },

  jobEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },

  jobInfo: {
    flex: 1,
  },

  jobTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  company: {
    fontSize: 14,
    color: "#5E6A7A",
    marginTop: 4,
  },

  location: {
    fontSize: 14,
    color: "#5E6A7A",
    marginTop: 6,
  },

  skills: {
    fontSize: 13,
    color: "#3F2ACF",
    marginTop: 8,
    fontWeight: "700",
  },
});