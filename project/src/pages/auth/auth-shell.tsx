import { Link } from 'react-router-dom';
import { Briefcase, FileSearch, Users, ShieldCheck } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between bg-primary p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-foreground/10">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight">{APP_NAME}</span>
        </div>

        <div className="relative max-w-md">
          <h1 className="font-serif-display text-3xl leading-tight text-balance">
            Recruitment intelligence for teams who hire with evidence.
          </h1>
          <p className="mt-4 text-sm text-primary-foreground/70 leading-relaxed">
            Upload resumes, compare candidates against job requirements, and keep human judgment at the center of every decision.
          </p>
          <div className="mt-8 space-y-3">
            {[
              { icon: FileSearch, text: 'AI-powered resume analysis with transparent evidence' },
              { icon: Users, text: 'Candidate ranking, comparison, and review workflows' },
              { icon: ShieldCheck, text: 'Multi-company workspace with role-based access' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <feature.icon className="h-4 w-4 text-primary-foreground/60 shrink-0" />
                <span className="text-sm text-primary-foreground/80">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-xs text-primary-foreground/40">
          © 2026 {APP_NAME}. All rights reserved.
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Briefcase className="h-4 w-4" />
            </div>
            <span className="font-semibold">{APP_NAME}</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthFooter({ text, linkText, to }: { text: string; linkText: string; to: string }) {
  return (
    <p className="mt-6 text-center text-sm text-muted-foreground">
      {text}{' '}
      <Link to={to} className="font-medium text-primary hover:underline">
        {linkText}
      </Link>
    </p>
  );
}
