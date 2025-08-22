'use client';

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const anomalySchema = z.object({
  reportType: z.enum([
    'duplicate-voter',
    'fake-candidate',
    'malicious-link',
    'misinformation',
    'other',
  ]),
  details: z.string().min(20, 'Please provide detailed information.'),
  evidence: z.any().optional(),
});

type AnomalyFormValues = z.infer<typeof anomalySchema>;

export default function VotingAnomaliesPage() {
  const { toast } = useToast();
  const form = useForm<AnomalyFormValues>({
    resolver: zodResolver(anomalySchema),
  });

  const onSubmit: SubmitHandler<AnomalyFormValues> = (data) => {
    // In a real application, you would handle the file upload and data submission to a backend.
    console.log('Voting Anomaly Report:', data);
    toast({
      title: 'Anomaly Report Submitted',
      description: 'Your report has been received and will be reviewed. Thank you.',
    });
    form.reset({ reportType: undefined, details: '' });
  };

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <PageHeader
        title="Report Voting Anomaly"
        description="Submit reports of suspicious election data, fake candidates, or other anomalies."
      />
      <Card className="animate-slide-in-up">
        <CardHeader>
          <CardTitle>New Anomaly Report</CardTitle>
          <CardDescription>
            Please provide as much detail as possible. All reports are treated with confidentiality.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="reportType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Anomaly</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select the type of anomaly" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="duplicate-voter">Duplicate Voter Entries</SelectItem>
                        <SelectItem value="fake-candidate">Fake Candidate/Party Information</SelectItem>
                        <SelectItem value="malicious-link">Malicious Links/Phishing</SelectItem>
                        <SelectItem value="misinformation">Misinformation/Disinformation Campaign</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detailed Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the anomaly, including dates, locations, names, and URLs if applicable."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="evidence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Evidence (Optional)</FormLabel>
                    <FormControl>
                      <Input type="file" {...form.register('evidence')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Submit Anomaly Report
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
