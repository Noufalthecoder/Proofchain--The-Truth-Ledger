import { AuthForm } from '@/components/auth-form';

export default function SignupPage() {
    return (
        <div className="flex justify-center items-center min-h-full">
            <AuthForm mode="signup" />
        </div>
    );
}