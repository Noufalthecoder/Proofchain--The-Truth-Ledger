'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { crossVerifyFakeNews, type CrossVerifyFakeNewsOutput } from '@/ai/flows/cross-verify-fake-news';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const reportSchema = z.object({
  contentType: z.enum(['text', 'image', 'video']),
  description: z.string().min(20, 'Please provide a detailed description.'),
});

type ReportFormValues = z.infer<typeof reportSchema>;

const verificationSchema = z.object({
  newsReport: z.string().min(20, 'Please provide a news report to verify.'),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;


export default function FakeNewsPage() {
  const { toast } = useToast();
  const [verificationResult, setVerificationResult] = useState<CrossVerifyFakeNewsOutput | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const reportForm = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
  });
  
  const verificationForm = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
  });

  const onReportSubmit: SubmitHandler<ReportFormValues> = (data) => {
    console.log('Fake News Report:', data);
    toast({
      title: 'Report Submitted',
      description: 'Thank you for helping keep the community informed.',
    });
    reportForm.reset({ contentType: undefined, description: '' });
  };
  
  const onVerifySubmit: SubmitHandler<VerificationFormValues> = async (data) => {
    setIsVerifying(true);
    setVerificationResult(null);
    try {
      const result = await crossVerifyFakeNews({ newsReport: data.newsReport });
      setVerificationResult(result);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Verification Failed',
        description: 'An error occurred while verifying the news report.',
        variant: 'destructive'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <PageHeader
        title="Fake News Center"
        description="Report potential misinformation and use AI to cross-verify news with trusted sources."
      />
      <Tabs defaultValue="report" className="w-full animate-slide-in-up">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="report">Report Fake News</TabsTrigger>
          <TabsTrigger value="verify">AI Cross-Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="report">
          <Card>
            <CardHeader>
              <CardTitle>Submit a Report</CardTitle>
              <CardDescription>
                If you encounter potential fake news, please report it here for community review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...reportForm}>
                <form onSubmit={reportForm.handleSubmit(onReportSubmit)} className="space-y-4">
                  <FormField
                    control={reportForm.control}
                    name="contentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="text">Text/Article</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={reportForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description / URL</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide a description, URL, or the text of the news item."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={reportForm.formState.isSubmitting}>
                    Submit Report
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verify">
          <Card>
            <CardHeader>
              <CardTitle>AI News Verifier</CardTitle>
              <CardDescription>
                Paste the content of a news report below to have AI cross-verify it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Form {...verificationForm}>
                <form onSubmit={verificationForm.handleSubmit(onVerifySubmit)} className="space-y-4">
                  <FormField
                    control={verificationForm.control}
                    name="newsReport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>News Report Content</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Paste the full text of the news report here..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isVerifying}>
                    {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify with AI
                  </Button>
                </form>
              </Form>

              {isVerifying && (
                 <div className="flex justify-center items-center pt-6">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                 </div>
              )}
              
              {verificationResult && (
                <div className="pt-4">
                  <h3 className="font-semibold mb-2">Verification Result:</h3>
                  <Card className="bg-muted/50">
                    <CardContent className="pt-6">
                        <p>{verificationResult.verificationResult}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
