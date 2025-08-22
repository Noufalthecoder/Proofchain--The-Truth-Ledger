import { AuthForm } from '@/components/auth-form';

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-full">
        <AuthForm mode="login" />
    </div>
  );
}