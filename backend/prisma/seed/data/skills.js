// fieldId indices according to fields.js (1..8), null for general skills

const dataScienceSkills = [
  "Python",
  "R",
  "SQL",
  "Machine Learning",
  "Deep Learning",
  "TensorFlow",
  "PyTorch",
  "Pandas",
  "NumPy",
  "Data Visualization"
].map((name) => ({ name, fieldId: 1 }));

const backendSkills = [
  "Node.js",
  "Java",
  "Spring Boot",
  "Express.js",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "GraphQL",
  "REST APIs",
  "Microservices"
].map((name) => ({ name, fieldId: 2 }));

const frontendSkills = [
  "JavaScript",
  "TypeScript",
  "React",
  "Vue.js",
  "Angular",
  "HTML5",
  "CSS3",
  "Tailwind CSS",
  "Next.js",
  "Webpack"
].map((name) => ({ name, fieldId: 3 }));

const devopsSkills = [
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "CI/CD",
  "Jenkins",
  "Terraform",
  "Linux",
  "Ansible"
].map((name) => ({ name, fieldId: 4 }));

const mobileSkills = [
  "React Native",
  "Flutter",
  "Swift",
  "Kotlin",
  "iOS Development",
  "Android Development",
  "Dart",
  "Mobile UI/UX"
].map((name) => ({ name, fieldId: 5 }));

const productSkills = [
  "Agile",
  "Scrum",
  "JIRA",
  "Product Strategy",
  "User Research",
  "Roadmapping",
  "Data Analysis",
  "Stakeholder Management"
].map((name) => ({ name, fieldId: 6 }));

const uiuxSkills = [
  "Figma",
  "Adobe XD",
  "Sketch",
  "User Interface Design",
  "User Experience",
  "Prototyping",
  "Design Systems",
  "Wireframing"
].map((name) => ({ name, fieldId: 7 }));

const securitySkills = [
  "Network Security",
  "Penetration Testing",
  "Ethical Hacking",
  "SIEM",
  "Firewall Management",
  "Incident Response",
  "Security Auditing",
  "Cryptography"
].map((name) => ({ name, fieldId: 8 }));

const generalSkills = [
  "Git",
  "GitHub",
  "Communication",
  "Problem Solving",
  "Team Leadership",
  "English",
  "Arabic",
  "Time Management"
].map((name) => ({ name, fieldId: null }));

export const skillsData = [
  ...dataScienceSkills,
  ...backendSkills,
  ...frontendSkills,
  ...devopsSkills,
  ...mobileSkills,
  ...productSkills,
  ...uiuxSkills,
  ...securitySkills,
  ...generalSkills
];

export function getSkillsByField(fieldId) {
  const main = skillsData.filter((s) => s.fieldId === fieldId);
  const general = skillsData.filter((s) => s.fieldId === null);
  return [...main, ...general];
}

