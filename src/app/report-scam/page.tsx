'use client';

import { useState, useRef, useEffect, type ChangeEvent } from 'react';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Upload, File as FileIcon, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { translateText } from '@/ai/flows/translate-text';


const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/quicktime'];

const reportSchema = z.object({
  description: z.string().min(20, 'Please provide a detailed description of the scam.'),
  files: z
    .custom<FileList>()
    .refine(files => files === undefined || files.length > 0, 'At least one file is required.')
    .refine(
      files => Array.from(files ?? []).every(file => file.size <= MAX_FILE_SIZE),
      `Max file size is 10MB.`
    )
    .refine(
      files => Array.from(files ?? []).every(file => ALLOWED_FILE_TYPES.includes(file.type)),
      'Only .jpg, .png, .webp, .mp4, and .mov files are accepted.'
    ),
  isAnonymous: z.boolean().default(false),
});

type ReportFormValues = z.infer<typeof reportSchema>;

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const languages = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'en-GB', label: 'English (UK)' },
    { value: 'hi-IN', label: 'Hindi' },
    { value: 'ta-IN', label: 'Tamil' },
    { value: 'te-IN', label: 'Telugu' },
    { value: 'kn-IN', label: 'Kannada' },
    { value: 'ml-IN', label: 'Malayalam' },
];

export default function ReportScamPage() {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [speechLanguage, setSpeechLanguage] = useState('en-US');
  const recognitionRef = useRef<any>(null);
  const descriptionOnListenStart = useRef('');

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      description: '',
      isAnonymous: false,
    },
  });
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      const dataTransfer = new DataTransfer();
      [...files, ...newFiles].forEach(file => dataTransfer.items.add(file));
      form.setValue('files', dataTransfer.files, { shouldValidate: true });
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => dataTransfer.items.add(file));
    form.setValue('files', dataTransfer.files, { shouldValidate: true });
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
            handleTranslation(finalTranscript);
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        toast({
            title: 'Voice Input Error',
            description: `An error occurred: ${event.error}`,
            variant: 'destructive'
        });
        setIsListening(false);
      };
    }
  }, [toast]);
  
  const handleTranslation = async (text: string) => {
    const sourceLanguageInfo = languages.find(l => l.value === speechLanguage);
    if (!sourceLanguageInfo || sourceLanguageInfo.value.startsWith('en-')) {
        form.setValue('description', descriptionOnListenStart.current + text);
        return;
    }

    setIsTranslating(true);
    try {
        const result = await translateText({ 
            text, 
            sourceLanguage: sourceLanguageInfo.label, 
            targetLanguage: 'English' 
        });
        form.setValue('description', descriptionOnListenStart.current + result.translatedText);
    } catch (error) {
        console.error('Translation error:', error);
        toast({
            title: 'Translation Failed',
            description: 'Could not translate the text.',
            variant: 'destructive',
        });
        // Fallback to original text
        form.setValue('description', descriptionOnListenStart.current + text);
    } finally {
        setIsTranslating(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if(recognitionRef.current) {
        recognitionRef.current.lang = speechLanguage;
        descriptionOnListenStart.current = form.getValues('description');
        recognitionRef.current?.start();
        setIsListening(true);
      }
    }
  };
  
  const onSubmit: SubmitHandler<ReportFormValues> = async (data) => {
    console.log({
        ...data,
        files: files.map(f => f.name),
        timestamp: new Date().toISOString(),
    });

    toast({
      title: 'Report Submitted Successfully',
      description: 'Thank you for your help in making the community safer.',
    });
    form.reset();
    setFiles([]);
  };

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <PageHeader
        title="Report a Scam"
        description="Help protect the community by reporting fraudulent or suspicious activity."
      />
      <Card className="animate-slide-in-up">
        <CardHeader>
          <CardTitle>New Scam Report</CardTitle>
          <CardDescription>
            Please provide as much detail as possible. Your report can be submitted anonymously.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Scam Description</FormLabel>
                        {recognitionRef.current && (
                            <div className="flex items-center gap-2">
                                <Select onValueChange={setSpeechLanguage} defaultValue={speechLanguage}>
                                    <SelectTrigger className="h-8 w-[140px] text-xs">
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {languages.map(lang => (
                                            <SelectItem key={lang.value} value={lang.value} className="text-xs">{lang.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={toggleListening}
                                    disabled={isTranslating}
                                    className={cn("h-8 w-8", isListening && "bg-destructive text-destructive-foreground animate-pulse")}
                                >
                                    {isListening ? <MicOff size={18}/> : <Mic size={18} />}
                                    <span className="sr-only">Toggle voice input</span>
                                </Button>
                            </div>
                        )}
                    </div>
                    <FormControl>
                        <div className="relative">
                            <Textarea
                                placeholder="Describe the scam in detail. What happened? What platform was used?"
                                className="min-h-[150px]"
                                {...field}
                            />
                            {isTranslating && (
                                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span className="ml-2">Translating...</span>
                                </div>
                            )}
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="files"
                render={() => (
                  <FormItem>
                    <FormLabel>Evidence (Screenshots, Videos)</FormLabel>
                    <FormControl>
                        <div>
                            <Button asChild variant="outline" className="w-full h-24 border-dashed cursor-pointer">
                                <label htmlFor="file-upload" className="flex flex-col items-center justify-center gap-2">
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                    <span className="text-muted-foreground">Click or drag to upload files</span>
                                    <Input 
                                        id="file-upload" 
                                        type="file" 
                                        className="sr-only" 
                                        multiple 
                                        accept={ALLOWED_FILE_TYPES.join(',')}
                                        onChange={handleFileChange} 
                                    />
                                </label>
                            </Button>
                            {files.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <p className="text-sm font-medium">Selected files:</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {files.map((file, i) => (
                                        <div key={i} className="relative group p-2 border rounded-md bg-muted/50 flex items-center gap-2">
                                            <FileIcon className="h-6 w-6 text-muted-foreground" />
                                            <span className="text-sm truncate">{file.name}</span>
                                            <Button 
                                                type="button"
                                                variant="ghost" 
                                                size="icon"
                                                className="absolute top-0 right-0 h-6 w-6 opacity-0 group-hover:opacity-100"
                                                onClick={() => removeFile(i)}
                                            >
                                                <X size={14}/>
                                            </Button>
                                        </div>
                                    ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isAnonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                        <FormLabel>Submit Anonymously</FormLabel>
                        <CardDescription>
                            If toggled, your user information will not be linked to this report.
                        </CardDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Submit Report
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
