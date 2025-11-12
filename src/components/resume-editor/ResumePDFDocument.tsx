import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ResumeData } from '@/types/resume';
import { resumeTheme } from '../resume-preview/resume-theme';

// Create react-pdf styles by referencing the same theme object
const styles = StyleSheet.create({
  page: {
    padding: resumeTheme.spacing.xlarge,
    fontSize: resumeTheme.fontSize.body,
    fontFamily: resumeTheme.fontFamily,
    backgroundColor: resumeTheme.colors.background,
    color: resumeTheme.colors.text,
  },
  header: {
    marginBottom: resumeTheme.spacing.xlarge,
    borderBottom: `2 solid ${resumeTheme.colors.primary}`,
    paddingBottom: resumeTheme.spacing.medium,
  },
  name: {
    fontSize: resumeTheme.fontSize.heading,
    fontWeight: 'bold',
    color: resumeTheme.colors.primary,
    marginBottom: resumeTheme.spacing.small,
  },
  contactInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    fontSize: resumeTheme.fontSize.body,
    color: resumeTheme.colors.subtleText,
    gap: resumeTheme.spacing.medium,
  },
  contactItem: {
    marginRight: 12,
  },
  section: {
    marginBottom: resumeTheme.spacing.xlarge,
  },
  sectionTitle: {
    fontSize: resumeTheme.fontSize.subheading,
    fontWeight: 'bold',
    color: resumeTheme.colors.primary,
    marginBottom: resumeTheme.spacing.small,
    textTransform: 'uppercase',
    borderBottom: `1 solid ${resumeTheme.colors.border}`,
    paddingBottom: resumeTheme.spacing.small,
  },
  subsection: {
    marginBottom: resumeTheme.spacing.medium,
  },
  subsectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: resumeTheme.spacing.small,
  },
  subsectionTitle: {
    fontSize: resumeTheme.fontSize.body,
    fontWeight: 'bold',
    color: resumeTheme.colors.text,
  },
  subsectionSubtitle: {
    fontSize: resumeTheme.fontSize.body,
    color: resumeTheme.colors.subtleText,
    fontStyle: 'italic',
    marginBottom: resumeTheme.spacing.small,
  },
  date: {
    fontSize: resumeTheme.fontSize.body,
    color: resumeTheme.colors.subtleText,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: resumeTheme.spacing.small,
    paddingLeft: resumeTheme.spacing.medium,
  },
  bullet: {
    width: resumeTheme.spacing.small,
    marginRight: resumeTheme.spacing.small,
    marginTop: resumeTheme.spacing.small,
  },
  bulletText: {
    flex: 1,
    fontSize: resumeTheme.fontSize.body,
    color: resumeTheme.colors.text,
    lineHeight: resumeTheme.lineHeight.body,
  },
  professionalSummary: {
    fontSize: resumeTheme.fontSize.body,
    color: resumeTheme.colors.text,
    lineHeight: resumeTheme.lineHeight.body,
    textAlign: 'justify',
  },
  skillCategory: {
    flexDirection: 'row',
    marginBottom: resumeTheme.spacing.small,
  },
  skillCategoryName: {
    fontSize: resumeTheme.fontSize.body,
    fontWeight: 'bold',
    color: resumeTheme.colors.text,
    width: 100,
  },
  skillsList: {
    flex: 1,
    fontSize: resumeTheme.fontSize.body,
    color: resumeTheme.colors.text,
  },
  projectTech: {
    fontSize: resumeTheme.fontSize.small,
    color: resumeTheme.colors.subtleText,
    marginTop: resumeTheme.spacing.small,
    fontStyle: 'italic',
  },
});

interface ResumePDFDocumentProps {
  data: ResumeData;
}

export const ResumePDFDocument: React.FC<ResumePDFDocumentProps> = React.memo(({ data }) => {
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
              <Text style={styles.contactItem}>{data.personalInfo.email}</Text>
            )}
            {data.personalInfo.phone && (
              <Text style={styles.contactItem}>{data.personalInfo.phone}</Text>
            )}
            {data.personalInfo.location && (
              <Text style={styles.contactItem}>{data.personalInfo.location}</Text>
            )}
            {data.personalInfo.linkedin && (
              <Text style={styles.contactItem}>{data.personalInfo.linkedin}</Text>
            )}
            {data.personalInfo.github && (
              <Text style={styles.contactItem}>{data.personalInfo.github}</Text>
            )}
            {data.personalInfo.portfolio && (
              <Text style={styles.contactItem}>{data.personalInfo.portfolio}</Text>
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
                    <Text style={styles.subsectionTitle}>{exp.jobTitle}</Text>
                    <Text style={styles.subsectionSubtitle}>
                      {exp.company}
                      {exp.location && ` • ${exp.location}`}
                    </Text>
                  </View>
                  <Text style={styles.date}>
                    {formatDate(exp.startDate)} - {exp.isCurrent ? 'Present' : (exp.endDate ? formatDate(exp.endDate) : 'Present')}
                  </Text>
                </View>
                {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                  <View>
                    {exp.bulletPoints.map((bullet, index) => (
                      <View key={index} style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{bullet.content}</Text>
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
                    {project.name}
                  </Text>
                </View>
                {project.link && (
                  <Text style={styles.projectTech}>
                    {project.link}
                  </Text>
                )}
                {project.bulletPoints && project.bulletPoints.length > 0 && (
                  <View>
                    {project.bulletPoints.map((bullet, index) => (
                      <View key={index} style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{bullet.content}</Text>
                      </View>
                    ))}
                  </View>
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
                    <Text style={styles.subsectionTitle}>{edu.school}</Text>
                    <Text style={styles.subsectionSubtitle}>
                      {edu.degree} in {edu.fieldOfStudy}
                      {edu.gpa && ` • GPA: ${edu.gpa}`}
                    </Text>
                  </View>
                  <Text style={styles.date}>
                    {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {data.certifications.map((cert) => (
              <View key={cert.id} style={styles.subsection}>
                <View style={styles.subsectionHeader}>
                  <Text style={styles.subsectionTitle}>{cert.name}</Text>
                  <Text style={styles.date}>{formatDate(cert.dateObtained)}</Text>
                </View>
                <Text style={styles.subsectionSubtitle}>{cert.issuingOrganization}</Text>
                {cert.credentialId && (
                  <Text style={styles.bulletText}>Credential ID: {cert.credentialId}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Awards */}
        {data.awards && data.awards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Awards</Text>
            {data.awards.map((award) => (
              <View key={award.id} style={styles.subsection}>
                <View style={styles.subsectionHeader}>
                  <Text style={styles.subsectionTitle}>{award.name}</Text>
                  <Text style={styles.date}>{formatDate(award.dateReceived)}</Text>
                </View>
                <Text style={styles.subsectionSubtitle}>{award.organization}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Volunteer Experience */}
        {data.volunteerExperience && data.volunteerExperience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Volunteer Experience</Text>
            {data.volunteerExperience.map((vol) => (
              <View key={vol.id} style={styles.subsection}>
                <View style={styles.subsectionHeader}>
                  <View>
                    <Text style={styles.subsectionTitle}>{vol.organization}</Text>
                    <Text style={styles.subsectionSubtitle}>{vol.role}</Text>
                  </View>
                  <Text style={styles.date}>
                    {formatDate(vol.startDate)} - {vol.isCurrent ? 'Present' : (vol.endDate ? formatDate(vol.endDate) : 'Present')}
                  </Text>
                </View>
                {vol.bulletPoints && vol.bulletPoints.length > 0 && (
                  <View>
                    {vol.bulletPoints.map((bullet, index) => (
                      <View key={index} style={styles.bulletPoint}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{bullet.content}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            {data.languages.map((lang, index) => (
              <View key={index} style={styles.skillCategory}>
                <Text style={styles.skillCategoryName}>{lang.language}:</Text>
                <Text style={styles.skillsList}>{lang.proficiency}</Text>
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
                <Text style={styles.skillsList}>{skillGroup.list.join(', ')}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
});

ResumePDFDocument.displayName = 'ResumePDFDocument';
