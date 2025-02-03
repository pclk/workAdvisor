"use client"

import {
  TextInput,
  Textarea,
  Select,
  MultiSelect,
  NumberInput,
  Button,
  Stack,
  Title,
  Text,
  Paper,
  Card,
  Grid,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useForm } from '@mantine/form';
import { useState } from 'react';
import { predictSalary } from './actions';
import { jobPresets } from './presets';

export default function SalaryForm() {
  interface FormValues {
    job_description: string;
    job_title: string;
    query: string;
    soft_skills: string[];
    hard_skills: string[];
    location_flexibility: string;
    contract_type: string;
    education_level: string;
    seniority: string;
    min_years_experience: number;
    field_of_study: string[];
  }

  const [selectedPreset, setSelectedPreset] = useState('data_scientist');

  const form = useForm<FormValues>({
    initialValues: {
      job_description: '',
      job_title: '',
      query: '',
      soft_skills: [] as string[],
      hard_skills: [] as string[],
      location_flexibility: 'unknown',
      contract_type: 'unknown',
      education_level: 'unknown',
      seniority: 'unknown',
      min_years_experience: 0,
      field_of_study: [] as string[],
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  // Load data scientist preset by default
  useState(() => {
    form.setValues(jobPresets.data_scientist);
  });
  const [prediction, setPrediction] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: typeof form.values) => {
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    const payload = {
      ...values,
      country_code: 'SG',
    };

    const result = await predictSalary(payload);

    if (result.success && result.data) {
      setPrediction(result.data.predicted_salary);
      notifications.show({
        title: 'Prediction Complete',
        message: `Predicted salary: $${result.data.predicted_salary.toLocaleString()}`,
        color: 'green',
        icon: <CheckCircle2 size={18} />,
      });
    } else {
      setError(result.error || 'Failed to predict salary');
      notifications.show({
        title: 'Prediction Failed',
        message: result.error || 'Failed to predict salary',
        color: 'red',
        icon: <XCircle size={18} />,
      });
    }

    setIsLoading(false);
  };

  return (
    <Paper shadow="xs" p="md" style={{ height: '100%' }}>
      <Title order={3} mb="lg">Salary Prediction Form</Title>
      <Select
        label="Load Preset"
        placeholder="Select a job preset"
        mb="lg"
        value={selectedPreset}
        data={[
          { value: 'software_engineer', label: 'Software Engineer' },
          { value: 'data_scientist', label: 'Data Scientist' },
          { value: 'product_manager', label: 'Product Manager' },
          { value: '', label: 'Custom' },
        ]}
        onChange={(value) => {
          setSelectedPreset(value || '');
          if (value && jobPresets[value as keyof typeof jobPresets]) {
            form.setValues(jobPresets[value as keyof typeof jobPresets]);
          } else {
            form.reset();
          }
        }}
      />
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Card withBorder shadow="sm">
          <Stack gap="md">
            <Grid>
              <Grid.Col span={12}>
                <TextInput
                  label="Job Title"
                  placeholder="Enter job title"
                  required
                  {...form.getInputProps('job_title')}
                />

                <Textarea
                  label="Job Description"
                  placeholder="Enter job description"
                  required
                  minRows={3}
                  {...form.getInputProps('job_description')}
                />

                <TextInput
                  label="Query"
                  placeholder="Enter query"
                  {...form.getInputProps('query')}
                />
              </Grid.Col>

              <Grid.Col span={6}>
                <MultiSelect
                  label="Soft Skills"
                  placeholder="Select soft skills"
                  styles={{
                    input: { paddingRight: 30 },
                  }}
                  data={[
                    'communication',
                    'leadership',
                    'teamwork',
                    'problem solving',
                    'time management',
                    'analytical thinking',
                    'research',
                    'strategic thinking',
                    'stakeholder management',
                  ]}
                  searchable
                  clearable
                  nothingFoundMessage="Nothing found..."
                  {...form.getInputProps('soft_skills')}
                />

              </Grid.Col>
              <Grid.Col span={6}>
                <MultiSelect
                  label="Hard Skills"
                  placeholder="Select hard skills"
                  styles={{
                    input: { paddingRight: 30 },
                  }}
                  data={[
                    'javascript',
                    'python',
                    'react',
                    'node.js',
                    'sql',
                    'aws',
                    'docker',
                    'machine learning',
                    'tensorflow',
                    'agile',
                    'jira',
                    'product development',
                    'market research',
                  ]}
                  searchable
                  clearable
                  nothingFoundMessage="Nothing found..."
                  {...form.getInputProps('hard_skills')}
                />

              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Location Flexibility"
                  placeholder="Select location flexibility"
                  data={[
                    { value: 'remote', label: 'Remote' },
                    { value: 'hybrid', label: 'Hybrid' },
                    { value: 'onsite', label: 'Onsite' },
                    { value: 'unknown', label: 'Unknown' },
                  ]}
                  {...form.getInputProps('location_flexibility')}
                />

              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Contract Type"
                  placeholder="Select contract type"
                  data={[
                    { value: 'full_time', label: 'Full Time' },
                    { value: 'part_time', label: 'Part Time' },
                    { value: 'contract', label: 'Contract' },
                    { value: 'unknown', label: 'Unknown' },
                  ]}
                  {...form.getInputProps('contract_type')}
                />

              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Education Level"
                  placeholder="Select education level"
                  data={[
                    { value: 'high_school', label: 'High School' },
                    { value: 'bachelors', label: 'Bachelor\'s Degree' },
                    { value: 'masters', label: 'Master\'s Degree' },
                    { value: 'phd', label: 'PhD' },
                    { value: 'unknown', label: 'Unknown' },
                  ]}
                  {...form.getInputProps('education_level')}
                />

              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Seniority"
                  placeholder="Select seniority level"
                  data={[
                    { value: 'entry', label: 'Entry Level' },
                    { value: 'mid', label: 'Mid Level' },
                    { value: 'senior', label: 'Senior Level' },
                    { value: 'lead', label: 'Lead' },
                    { value: 'unknown', label: 'Unknown' },
                  ]}
                  {...form.getInputProps('seniority')}
                />

              </Grid.Col>
              <Grid.Col span={6}>
                <NumberInput
                  label="Minimum Years of Experience"
                  placeholder="Enter minimum years of experience"
                  min={0}
                  decimalScale={1}
                  {...form.getInputProps('min_years_experience')}
                />

              </Grid.Col>
              <Grid.Col span={6}>
                <MultiSelect
                  label="Field of Study"
                  placeholder="Select field of study"
                  styles={{
                    input: { paddingRight: 30 },
                  }}
                  data={[
                    'computer science',
                    'software engineering',
                    'data science',
                    'statistics',
                    'mathematics',
                    'business administration',
                    'engineering',
                  ]}
                  searchable
                  {...form.getInputProps('field_of_study')}
                />

              </Grid.Col>
            </Grid>

            <Stack>
              <Button
                type="submit"
                mt="md"
                loading={isLoading}
              >
                {isLoading ? 'Calculating...' : 'Submit'}
              </Button>

              {prediction !== null && (
                <Paper p="md" withBorder>
                  <Title order={4}>Predicted Salary</Title>
                  <Text size="xl" fw={700}>
                    ${prediction.toLocaleString()}
                  </Text>
                </Paper>
              )}

              {error && (
                <Text c="red" size="sm">
                  {error}
                </Text>
              )}
            </Stack>
          </Stack>
        </Card>
      </form>
    </Paper>
  );
}
