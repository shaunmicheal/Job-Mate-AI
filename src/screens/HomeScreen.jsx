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
        <Text style={styles.aiEmoji}>✨</Text>

        <Text style={styles.aiTitle}>
          AI Career Assistant
        </Text>

        <Text style={styles.aiText}>
          Analyze jobs, improve your CV and prepare for interviews.
        </Text>

        <TouchableOpacity
  style={styles.aiButton}
  onPress={() => navigation.navigate("AIAssistant")}
>
  <Text style={styles.aiButtonText}>
    Start with AI →
  </Text>
</TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Recommended Jobs
        </Text>

        <View style={styles.jobCard}>
          <Text style={styles.jobEmoji}>💻</Text>
<TouchableOpacity
  style={styles.jobCard}
  onPress={() => navigation.navigate("Jobs")}
>
  <Text style={styles.jobEmoji}>💻</Text>

  <View style={styles.jobInfo}>
    <Text style={styles.jobTitle}>
      Frontend Developer
    </Text>

    <Text style={styles.company}>
      Tech Company
    </Text>

    <Text style={styles.location}>
      📍 Harare
    </Text>

    <Text style={styles.skills}>
      React • JavaScript • Git
    </Text>
  </View>
</TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
  },

  greeting: {
    fontSize: 17,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 38,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },

  aiCard: {
    margin: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 24,
  },

  aiEmoji: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },

  aiTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.white,
  },

  aiText: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.primaryLight,
    marginTop: spacing.sm,
  },

  aiButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    marginTop: spacing.md,
  },

  aiButtonText: {
    color: colors.primary,
    fontWeight: "700",
  },

  section: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },

  jobCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  jobEmoji: {
    fontSize: 32,
    marginRight: spacing.md,
  },

  jobInfo: {
    flex: 1,
  },

  jobTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },

  company: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },

  location: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
  },

  skills: {
    fontSize: 13,
    color: colors.primary,
    marginTop: 8,
    fontWeight: "600",
  },
});