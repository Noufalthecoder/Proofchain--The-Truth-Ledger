'use client';

import { useState } from 'react';
import type { FC, ChangeEvent } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Shield, Upload, Loader2, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';

interface Document {
  id: string;
  name: string;
  hash: string;
  qrCodeUrl: string;
  file: File;
}

interface DocumentCardProps {
  document: Document;
}

type VerificationStatus = 'idle' | 'authentic' | 'tampered';

export const DocumentCard: FC<DocumentCardProps> = ({ document }) => {
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleVerification = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    setIsVerifying(true);
    // Simulate async verification process
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, we'd calculate the hash of the new file
    // and compare it to `document.hash`.
    // Here, we'll just simulate a result.
    const isAuthentic = Math.random() > 0.3; // 70% chance of being authentic
    setStatus(isAuthentic ? 'authentic' : 'tampered');

    setIsVerifying(false);
    setTimeout(() => setIsDialogOpen(false), 2000);
  };

  const resetState = () => {
    setStatus('idle');
    setIsVerifying(false);
  }

  const cardStatusClasses = {
    idle: 'border-border',
    authentic: 'border-green-500 shadow-lg shadow-green-500/30',
    tampered: 'border-red-500 shadow-lg shadow-red-500/30',
  };

  const statusBadge = {
    idle: null,
    authentic: (
      <Badge variant="outline" className="border-green-600 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
        <CheckCircle className="mr-1 h-3 w-3" /> Authentic
      </Badge>
    ),
    tampered: (
      <Badge variant="destructive">
        <XCircle className="mr-1 h-3 w-3" /> Tampered
      </Badge>
    ),
  };

  return (
    <Card className={cn('transition-all duration-500', cardStatusClasses[status], status !== 'idle' && 'animate-glow')}>
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-base leading-tight break-all">{document.name}</CardTitle>
            {statusBadge[status]}
        </div>
        <CardDescription className="flex items-center gap-1 text-xs pt-1">
          <QrCode className="h-3 w-3" />
          <span>{document.hash}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center items-center">
        <Image
          src={document.qrCodeUrl}
          alt={`QR code for ${document.name}`}
          width={128}
          height={128}
          className="rounded-md"
          data-ai-hint="qr code"
        />
      </CardContent>
      <CardFooter>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetState(); setIsDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button className="w-full" variant="outline">
              <Shield className="mr-2 h-4 w-4" />
              Verify Authenticity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Verify Document</DialogTitle>
              <DialogDescription>
                Upload the original document to compare its hash and verify authenticity.
              </DialogDescription>
            </DialogHeader>
            {isVerifying ? (
              <div className="flex flex-col items-center justify-center gap-4 py-8">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Verifying, please wait...</p>
              </div>
            ) : status !== 'idle' ? (
                <div className="flex flex-col items-center justify-center gap-4 py-8">
                    {status === 'authentic' ? 
                        <CheckCircle className="h-16 w-16 text-green-500" /> : 
                        <XCircle className="h-16 w-16 text-red-500" />
                    }
                    <h3 className="text-2xl font-bold">{status === 'authentic' ? "Verification Successful" : "Verification Failed"}</h3>
                    <p className="text-muted-foreground">{status === 'authentic' ? "The document is authentic." : "The document has been tampered with."}</p>
                </div>
            ) : (
              <div className="py-4">
                <Button asChild variant="outline" className="w-full h-24 border-dashed">
                  <label htmlFor={`verify-upload-${document.id}`} className="cursor-pointer flex flex-col items-center justify-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-muted-foreground">Click or drag to upload file</span>
                    <input id={`verify-upload-${document.id}`} type="file" className="sr-only" onChange={handleVerification} />
                  </label>
                </Button>
              </div>
            )}
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};
