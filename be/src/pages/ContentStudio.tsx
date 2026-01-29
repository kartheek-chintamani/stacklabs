import { AppLayout } from '@/components/layout/AppLayout';
import SmartLinkInput from '@/components/studio/SmartLinkInput';
import SocialPreview from '@/components/studio/SocialPreview';
import HistoryRail from '@/components/studio/HistoryRail';
import TrendingDealsList from '@/components/studio/TrendingDealsList';
import { Zap } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function ContentStudio() {
    return (
        <AppLayout
            title="Content Studio"
            description="Your command center for affiliate marketing."
        >
            <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-12">

                {/* Helper Hero */}
                <section className="text-center space-y-4 pt-4">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-blue-600">
                            Paste. Polish. Post.
                        </span>
                    </h1>
                    <p className="text-muted-foreground max-w-lg mx-auto text-lg">
                        Turn any product URL into a high-converting social post in seconds.
                    </p>
                </section>

                {/* Main Action Area */}
                <section className="space-y-8">
                    <SmartLinkInput />
                    <HistoryRail />
                    <SocialPreview />
                </section>

                <Separator className="my-12 opacity-50" />

                {/* Discovery Section */}
                <section>
                    <TrendingDealsList />
                </section>

            </div>
        </AppLayout>
    );
}
