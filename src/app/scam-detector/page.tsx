'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
  CardFooter
} from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { detectScamMessage, type DetectScamMessageOutput } from '@/ai/flows/detect-scam-messages';
import { Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const formSchema = z.object({
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

export default function ScamDetectorPage() {
  const [result, setResult] = useState<DetectScamMessageOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const aiResult = await detectScamMessage({ message: values.message });
      setResult(aiResult);
    } catch (error) {
      console.error('Error detecting scam:', error);
      // Handle error display to user
    } finally {
      setIsLoading(false);
    }
  }

  const resultCardClass = result?.isScam
    ? 'border-destructive shadow-lg shadow-red-500/30 animate-glow'
    : 'border-green-500 shadow-lg shadow-green-500/30 animate-glow';

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <PageHeader
        title="AI Scam Message Detector"
        description="Paste a message to analyze it for potential scam content using AI."
      />
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="animate-slide-in-up">
          <CardHeader>
            <CardTitle>Analyze Message</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message to analyze</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'Congratulations! You've won a free iPhone...'"
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Analyze
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="animate-slide-in-up" style={{ animationDelay: '150ms' }}>
          {isLoading ? (
            <Card className="flex h-full min-h-[300px] items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>AI is analyzing...</p>
              </div>
            </Card>
          ) : result ? (
            <Card className={cn('transition-all', resultCardClass)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result.isScam ? (
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  ) : (
                    <ShieldCheck className="h-6 w-6 text-green-600" />
                  )}
                  Analysis Result
                </CardTitle>
                <CardDescription>
                  The AI has analyzed the message for potential scam indicators.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Badge variant={result.isScam ? 'destructive' : 'default'} className={!result.isScam ? 'bg-green-600' : ''}>
                    {result.isScam ? 'Likely a Scam' : 'Likely Safe'}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Reasoning</h3>
                  <p className="text-sm text-muted-foreground">{result.reason}</p>
                </div>
              </CardContent>
              <CardFooter>
                 <div className="w-full">
                    <p className="text-sm font-medium mb-1">Confidence: {Math.round(result.confidence * 100)}%</p>
                    <Progress value={result.confidence * 100} className={result.isScam ? '[&>div]:bg-destructive' : '[&>div]:bg-green-600'} />
                 </div>
              </CardFooter>
            </Card>
          ) : (
            <Card className="flex h-full min-h-[300px] items-center justify-center">
              <div className="text-center text-muted-foreground">
                <p>Results will be displayed here.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
