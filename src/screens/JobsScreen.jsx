import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { getJobs } from "../services/jobsApi";

const fallbackJobs = [
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

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractRequiredSkills(job) {
  if (!job) {
    return "Career opportunity";
  }

  const rawJob = job.raw || job || {};
  const title = String(job.title || rawJob.title || "");
  const requirements = rawJob.requirements || rawJob.description || job.requirements || job.description || "";
  const text = stripHtml(requirements);
  const fullText = `${title} ${text}`.toLowerCase();

  const skillGroups = [
    {
      regex: /react native|react-native/i,
      skills: ["React Native", "JavaScript", "TypeScript", "Mobile UI"],
    },
    {
      regex: /react\s*js|react/i,
      skills: ["React", "JavaScript", "CSS", "REST APIs"],
    },
    {
      regex: /node\.?js|backend|express|api/i,
      skills: ["Node.js", "REST APIs", "SQL", "Git"],
    },
    {
      regex: /python|django|flask/i,
      skills: ["Python", "Django", "SQL", "APIs"],
    },
    {
      regex: /full stack|full-stack/i,
      skills: ["React", "Node.js", "SQL", "Git"],
    },
    {
      regex: /frontend|ui|ux|web/i,
      skills: ["HTML", "CSS", "JavaScript", "Responsive Design"],
    },
    {
      regex: /mobile|android|ios/i,
      skills: ["React Native", "Mobile UI", "API Integration", "App Testing"],
    },
    {
      regex: /data|analyst|analytics/i,
      skills: ["Excel", "SQL", "Reporting", "Data Analysis"],
    },
    {
      regex: /sales|business development|account|customer/i,
      skills: ["Sales", "Negotiation", "CRM", "Customer Service"],
    },
    {
      regex: /teacher|education|school/i,
      skills: ["Teaching", "Classroom Management", "Communication", "Planning"],
    },
  ];

  for (const group of skillGroups) {
    if (group.regex.test(fullText)) {
      return group.skills.join(" • ");
    }
  }

  const listMatches = Array.from(
    String(requirements || "").matchAll(/<li[^>]*>(.*?)<\/li>/gi)
  ).map((match) => stripHtml(match[1]))
    .filter(Boolean)
    .slice(0, 4);

  if (listMatches.length > 0) {
    return listMatches.join(" • ");
  }

  if (text) {
    const words = text
      .replace(/[^a-zA-Z0-9\s./+-]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .slice(0, 4)
      .join(" • ");

    return words || "Communication • Teamwork";
  }

  return "Communication • Teamwork";
}

export default function JobsScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState(fallbackJobs);
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [countries, setCountries] = useState(["Zimbabwe"]);

  useEffect(() => {
    let isMounted = true;

    async function loadJobs() {
      try {
        const query = search.trim();
        const result = await getJobs({
          provider: "all",
          ...(query ? { search: query } : {}),
        });

        if (!isMounted) {
          return;
        }

        const mappedJobs = (result?.jobs || []).map((job, index) => ({
          id: job.id || `${job.provider}-${index}`,
          title: job.title || "Open role",
          company: job.company || job.location?.display || "Unknown company",
          location:
            job.location?.display ||
            job.location?.city ||
            job.location?.country ||
            "Zimbabwe",
          country:
            job.location?.country ||
            (job.location?.display?.includes("Zimbabwe") ? "Zimbabwe" : "Remote"),
          skills: extractRequiredSkills(job.raw || job),
          raw: job,
        }));

        const uniqueCountries = [...new Set(mappedJobs.map((job) => job.country).filter(Boolean))];

        setTotalJobs(mappedJobs.length);
        setJobs(mappedJobs);
        setCountries(uniqueCountries.length > 0 ? uniqueCountries : ["Zimbabwe"]);
      } catch (error) {
        if (isMounted) {
          setJobs(fallbackJobs);
          setTotalJobs(fallbackJobs.length);
          setCountries(["Zimbabwe"]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadJobs();

    return () => {
      isMounted = false;
    };
  }, [search]);

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Jobs 💼</Text>

        <Text style={styles.subtitle}>Jobs available in {countries.join(", ") || "Zimbabwe"}.</Text>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>{filteredJobs.length}</Text>
          <Text style={styles.summaryLabel}>Jobs found</Text>
        </View>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search jobs..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.jobs}>
        {loading && filteredJobs.length === 0 && (
          <Text style={styles.noJobs}>Loading jobs...</Text>
        )}

        {filteredJobs.map((job) => (
          <View key={job.id} style={styles.jobCard}>
            <Text style={styles.jobEmoji}>💼</Text>

            <Text style={styles.jobTitle}>{job.title}</Text>

            <Text style={styles.company}>{job.company}</Text>

            <Text style={styles.location}>📍 {job.location}</Text>

            <Text style={styles.skillsLabel}>Required Skills</Text>
            <Text style={styles.skills}>{job.skills}</Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate("JobDetails", { job })}
            >
              <Text style={styles.buttonText}>View Job</Text>
            </TouchableOpacity>
          </View>
        ))}

        {!loading && filteredJobs.length === 0 && (
          <Text style={styles.noJobs}>No jobs found for your search.</Text>
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

  summaryBox: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignSelf: "flex-start",
    marginTop: 12,
  },

  summaryValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#240be0",
  },

  summaryLabel: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
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

  skillsLabel: {
    marginTop: 10,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },

  skills: {
    marginTop: 6,
    fontSize: 13,
    color: "#240be0",
    fontWeight: "600",
    lineHeight: 20,
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