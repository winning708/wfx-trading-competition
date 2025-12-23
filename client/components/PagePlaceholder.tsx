import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";

interface PagePlaceholderProps {
  title: string;
  description: string;
}

export default function PagePlaceholder({
  title,
  description,
}: PagePlaceholderProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="rounded-lg border border-border bg-card p-8 md:p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-warning/10">
              <AlertCircle className="h-7 w-7 text-warning" />
            </div>
          </div>

          <h1 className="mb-3 text-2xl md:text-3xl font-bold text-foreground">
            {title}
          </h1>

          <p className="mb-8 text-muted-foreground">{description}</p>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
