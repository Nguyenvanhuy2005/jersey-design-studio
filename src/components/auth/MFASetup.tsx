
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { LoaderCircle } from 'lucide-react';

export function MFASetup() {
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);

  const enrollMFA = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp'
      });
      
      if (error) throw error;
      
      if (data) {
        setQrCode(data.totp.qr_code);
        setFactorId(data.id);
      }
    } catch (error) {
      console.error('Error enrolling MFA:', error);
      toast.error('Could not set up MFA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyMFA = async () => {
    if (!factorId || !verifyCode) return;
    
    try {
      setLoading(true);
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      
      if (challengeError) throw challengeError;
      if (!challengeData.id) throw new Error('No challenge ID returned');
      
      setChallengeId(challengeData.id);
      
      const { data, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code: verifyCode
      });

      if (verifyError) throw verifyError;

      if (data) {
        toast.success('MFA successfully set up!');
        setQrCode(null);
        setVerifyCode('');
      }
    } catch (error) {
      console.error('Error verifying MFA:', error);
      toast.error('Could not verify MFA code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (qrCode) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Scan this QR code with your authenticator app:
        </p>
        <div className="flex justify-center">
          <img src={qrCode} alt="MFA QR Code" className="w-48 h-48" />
        </div>
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Enter verification code"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            disabled={loading}
          />
          <Button 
            onClick={verifyMFA} 
            disabled={loading || !verifyCode} 
            className="w-full"
          >
            {loading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify MFA'
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button onClick={enrollMFA} disabled={loading}>
      {loading ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Setting up...
        </>
      ) : (
        'Set up MFA'
      )}
    </Button>
  );
}
