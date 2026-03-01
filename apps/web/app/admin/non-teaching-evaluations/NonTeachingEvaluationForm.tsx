'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Textarea } from '@/app/components/ui/textarea';
import { CreateNonTeachingEvaluationDto, NonTeachingEvaluation } from '@/types/non-teaching-evaluation';
import { Personnel } from '@/types/personnel';
import { useQuery } from '@tanstack/react-query';
import { getPersonnel } from '@/lib/api/personnel.api';

const formSchema = z.object({
  personnel: z.string().min(1, 'Personnel is required.'),
  evaluationDate: z.string().min(1, 'Evaluation date is required.'),
  semester: z.string().min(1, 'Semester is required.'),
  JK: z.coerce.number().min(1).max(5),
  WQ: z.coerce.number().min(1).max(5),
  PR: z.coerce.number().min(1).max(5),
  TW: z.coerce.number().min(1).max(5),
  RL: z.coerce.number().min(1).max(5),
  IN: z.coerce.number().min(1).max(5),
  feedback: z.string().optional(),
  evaluatedBy: z.string().optional(),
});

interface NonTeachingEvaluationFormProps {
  onSubmit: (values: CreateNonTeachingEvaluationDto) => void;
  defaultValues?: NonTeachingEvaluation;
  isSubmitting: boolean;
}

export function NonTeachingEvaluationForm({
  onSubmit,
  defaultValues,
  isSubmitting,
}: NonTeachingEvaluationFormProps) {
  const { data: personnelList, isLoading: isLoadingPersonnel } = useQuery<Personnel[]>({
    queryKey: ['personnel'],
    queryFn: getPersonnel,
  });

  const nonTeachingPersonnel = personnelList?.filter(
    (person) => person.personnelType === 'Non-Teaching'
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personnel: defaultValues?.personnel?._id || '',
      evaluationDate: defaultValues?.evaluationDate
        ? new Date(defaultValues.evaluationDate).toISOString().split('T')[0]
        : '',
      semester: defaultValues?.semester || '',
      JK: defaultValues?.scores?.JK || 3,
      WQ: defaultValues?.scores?.WQ || 3,
      PR: defaultValues?.scores?.PR || 3,
      TW: defaultValues?.scores?.TW || 3,
      RL: defaultValues?.scores?.RL || 3,
      IN: defaultValues?.scores?.IN || 3,
      feedback: defaultValues?.feedback || '',
      evaluatedBy: defaultValues?.evaluatedBy || '',
    },
  });

  const handleSubmitInternal = (values: z.infer<typeof formSchema>) => {
    const dto: CreateNonTeachingEvaluationDto = {
      personnel: values.personnel,
      evaluationDate: new Date(values.evaluationDate).toISOString(),
      semester: values.semester,
      scores: {
        JK: values.JK,
        WQ: values.WQ,
        PR: values.PR,
        TW: values.TW,
        RL: values.RL,
        IN: values.IN,
      },
      feedback: values.feedback,
      evaluatedBy: values.evaluatedBy,
    };
    onSubmit(dto);
  };

  if (isLoadingPersonnel) {
    return <div>Loading personnel...</div>;
  }

  const metricLabels: Record<string, string> = {
    JK: 'Job Knowledge',
    WQ: 'Work Quality',
    PR: 'Productivity',
    TW: 'Teamwork',
    RL: 'Reliability',
    IN: 'Initiative',
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitInternal)} className="space-y-6">
        <FormField
          control={form.control}
          name="personnel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Non-Teaching Personnel</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Select non-teaching personnel" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {nonTeachingPersonnel?.map((person) => (
                    <SelectItem key={person._id} value={person._id}>
                      {person.firstName} {person.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="evaluationDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Evaluation Date</FormLabel>
                <FormControl><Input type="date" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="semester"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semester</FormLabel>
                <FormControl><Input placeholder="e.g., 1st Sem 2024" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {['JK', 'WQ', 'PR', 'TW', 'RL', 'IN'].map((metric) => (
            <FormField
              key={metric}
              control={form.control}
              name={metric as 'JK' | 'WQ' | 'PR' | 'TW' | 'RL' | 'IN'}
              render={({ field }) => (
                <FormItem>
                  <FormLabel title={metricLabels[metric]}>{metric}</FormLabel>
                  <FormControl><Input type="number" step="0.01" min="1" max="5" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <FormField
          control={form.control}
          name="feedback"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Feedback</FormLabel>
              <FormControl><Textarea placeholder="Optional feedback" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="evaluatedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Evaluated By</FormLabel>
              <FormControl><Input placeholder="e.g., Manager Name" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Form>
  );
}
