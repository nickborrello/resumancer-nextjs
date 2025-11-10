import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import { ResumeData } from '@/types/resume';

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #2563eb',
    paddingBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    fontSize: 10,
    color: '#4b5563',
    gap: 12,
  },
  contactItem: {
    marginRight: 12,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    textTransform: 'uppercase',
    borderBottom: '1 solid #e5e7eb',
    paddingBottom: 4,
  },
  subsection: {
    marginBottom: 12,
  },
  subsectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  subsectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
  },
  subsectionSubtitle: {
    fontSize: 10,
    color: '#4b5563',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  date: {
    fontSize: 10,
    color: '#6b7280',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 3,
    paddingLeft: 12,
  },
  bullet: {
    width: 4,
    marginRight: 8,
    marginTop: 4,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
  },
  professionalSummary: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  skillCategory: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  skillCategoryName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
    width: 100,
  },
  skillsList: {
    flex: 1,
    fontSize: 10,
    color: '#374151',
  },
  projectTech: {
    fontSize: 9,
    color: '#6b7280',
    marginTop: 2,
    fontStyle: 'italic',
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
  },
});

interface ResumePDFDocumentProps {
  data: ResumeData;
}

export const ResumePDFDocument: React.FC<ResumePDFDocumentProps> = ({ data }) => {
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Personal Info */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.personalInfo.fullName || 'Your Name'}</Text>
          <View style={styles.contactInfo}>
            {data.personalInfo.email && (
              <Link src={`mailto:${data.personalInfo.email}`} style={[styles.contactItem, styles.link]}>
                {data.personalInfo.email}
              </Link>
            )}
            {data.personalInfo.phone && (
              <Text style={styles.contactItem}>{data.personalInfo.phone}</Text>
            )}
            {data.personalInfo.location && (
              <Text style={styles.contactItem}>{data.personalInfo.location}</Text>
            )}
            {data.personalInfo.linkedin && (
              <Link src={data.personalInfo.linkedin} style={[styles.contactItem, styles.link]}>
                LinkedIn
              </Link>
            )}
            {data.personalInfo.github && (
              <Link src={data.personalInfo.github} style={[styles.contactItem, styles.link]}>
                GitHub
              </Link>
            )}
            {data.personalInfo.portfolio && (
              <Link src={data.personalInfo.portfolio} style={[styles.contactItem, styles.link]}>
                Portfolio
              </Link>
            )}
          </View>
        </View>

        {/* Professional Summary */}
        {data.professionalSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.professionalSummary}>{data.professionalSummary}</Text>
          </View>
        )}

        {/* Experience */}
        {data.experiences && data.experiences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.experiences.map((exp) => (
              <View key={exp.id} style={styles.subsection}>
                <View style={styles.subsectionHeader}>
                  <View>
                    <Text style={styles.subsectionTitle}>{exp.position}</Text>
                    <Text style={styles.subsectionSubtitle}>
                      {exp.company}
                      {exp.location && ` • ${exp.location}`}
                    </Text>
                  </View>
                  <Text style={styles.date}>
                    {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                  </Text>
                </View>
                {exp.description && exp.description.length > 0 && (
                  <View>
                    {exp.description.map((item, index) => (
                      <View key={index} style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects.map((project) => (
              <View key={project.id} style={styles.subsection}>
                <View style={styles.subsectionHeader}>
                  <Text style={styles.subsectionTitle}>
                    {project.link ? (
                      <Link src={project.link} style={styles.link}>
                        {project.name}
                      </Link>
                    ) : (
                      project.name
                    )}
                  </Text>
                  {project.startDate && project.endDate && (
                    <Text style={styles.date}>
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </Text>
                  )}
                </View>
                {project.description && (
                  <Text style={styles.bulletText}>{project.description}</Text>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <Text style={styles.projectTech}>
                    Technologies: {project.technologies.join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu) => (
              <View key={edu.id} style={styles.subsection}>
                <View style={styles.subsectionHeader}>
                  <View>
                    <Text style={styles.subsectionTitle}>{edu.institution}</Text>
                    <Text style={styles.subsectionSubtitle}>
                      {edu.degree} in {edu.field}
                      {edu.gpa && ` • GPA: ${edu.gpa}`}
                    </Text>
                  </View>
                  <Text style={styles.date}>
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </Text>
                </View>
                {edu.description && (
                  <Text style={styles.bulletText}>{edu.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {data.skills.map((skillGroup, index) => (
              <View key={index} style={styles.skillCategory}>
                <Text style={styles.skillCategoryName}>{skillGroup.category}:</Text>
                <Text style={styles.skillsList}>{skillGroup.skills.join(', ')}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
};
