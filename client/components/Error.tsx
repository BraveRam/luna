"use client"

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";

export default function ErrorPage() {
    return (
        <div className="flex min-h-screen items-center justify-center px-4 sm:px-6">
            <Alert className="w-full max-w-md shadow-xl border">
                <Terminal className="h-6 w-6" />
                <AlertTitle className="text-2xl font-bold mt-2">
                    Oops! Something went wrong.
                </AlertTitle>
                <AlertDescription className="mt-2">
                    We encountered an unexpected error. Please try refreshing the page, or contact support if the problem persists.
                </AlertDescription>
                <div className="mt-6 flex gap-2">
                    <Button variant="outline" onClick={() => window.location.reload()}>
                        Refresh
                    </Button>
                    <Button asChild>
                        <a href="mailto:support@example.com">Contact Support</a>
                    </Button>
                </div>
            </Alert>
        </div>
    );
}