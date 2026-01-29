import React, { useEffect, useRef, useState } from 'react';
import { useContentStudio } from '@/store/useContentStudio';
import { STORE_COLORS } from '@/lib/urlParser';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Link, Copy, Check, Settings as SettingsIcon, Plus } from 'lucide-react';
import { useDeals } from '@/hooks/useDeals';
import { cn } from '@/lib/utils';
import { useAffiliatePrograms } from '@/hooks/useAffiliatePrograms';
import { toast } from 'sonner';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function SmartLinkInput() {
    const navigate = useNavigate();
    const { currentUrl, detectedStore, isLoading, setUrl, productDetails, clearCurrentSession } = useContentStudio();
    const { convertToAffiliateLink, loading: programsLoading, programs } = useAffiliatePrograms();
    const { createDeal } = useDeals();
    const inputRef = useRef<HTMLInputElement>(null);

    const [affiliateUrl, setAffiliateUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [missingConfig, setMissingConfig] = useState(false);
    const [isCustomUrl, setIsCustomUrl] = useState(false);

    useEffect(() => {
        // Auto-focus on mount
        inputRef.current?.focus();
    }, []);

    // Generate affiliate link when currentUrl changes
    useEffect(() => {
        if (!currentUrl) {
            setAffiliateUrl('');
            setMissingConfig(false);
            return;
        }

        if (programsLoading) return;

        // If Custom URL is checked, we SKIP all affiliate logic and just accept the input as is
        if (isCustomUrl) {
            setAffiliateUrl(currentUrl);
            setMissingConfig(false);
            return;
        }

        const { affiliateUrl: generated, program } = convertToAffiliateLink(currentUrl);

        // Check if we actually converted it or if it's just the same URL
        // If detectedStore is a known store but we have no program for it, flags missing config
        const isSupportedStore = ['amazon', 'flipkart', 'myntra', 'ajio'].includes(detectedStore);

        // If no program found and it's a supported store, flag it
        // But if generated is different, it means we found something (maybe Cuelinks fallback)
        if (isSupportedStore && !program && generated === currentUrl) {
            setMissingConfig(true);
            setAffiliateUrl('');
        } else if (generated !== currentUrl) {
            setAffiliateUrl(generated);
            setMissingConfig(false);
        } else {
            setAffiliateUrl('');
            setMissingConfig(false);
        }

    }, [currentUrl, convertToAffiliateLink, programsLoading, detectedStore, isCustomUrl]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setUrl('');
            setAffiliateUrl('');
            setMissingConfig(false);
            setIsCustomUrl(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(affiliateUrl);
        setCopied(true);
        toast.success('Affiliate link copied!');
        setTimeout(() => setCopied(false), 2000);
    }


    const handleSave = async () => {
        console.log('💾 Save button clicked');

        if (!affiliateUrl) {
            console.warn('⚠️ No affiliate URL - cannot save');
            return;
        }

        setIsSaving(true);
        // Helper to parse price string like "₹71,290" -> 71290
        const parsePrice = (priceStr?: string) => {
            if (!priceStr) return 0;
            return Number(priceStr.replace(/[^0-9.]/g, '')) || 0;
        };

        const currentPrice = parsePrice(productDetails?.currentPrice);
        const originalPrice = parsePrice(productDetails?.originalPrice);
        const discountPercent = originalPrice > 0
            ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
            : 0;

        const dealData = {
            title: productDetails?.title || `Link to ${detectedStore}`,
            original_url: currentUrl,
            affiliate_url: affiliateUrl,
            description: productDetails?.title || '',
            category: 'other' as const,
            image_url: productDetails?.image || '',
            original_price: originalPrice,
            discounted_price: currentPrice,
            discount_percent: discountPercent,
            merchant_name: detectedStore !== 'other' ? detectedStore : 'Unknown',
        };

        console.log('📦 Deal data to save:', dealData);

        try {
            const result = await createDeal(dealData);

            console.log('📊 createDeal result:', result);

            if (result) {
                console.log('✅ Product saved successfully, clearing form...');
                // Clear the form after successful save
                setAffiliateUrl('');
                setIsCustomUrl(false);
                clearCurrentSession();

                // Show success toast with action to view products
                toast.success('Product saved successfully!', {
                    action: {
                        label: 'View Products',
                        onClick: () => {
                            console.log('🔗 Navigating to /products');
                            navigate('/products');
                        }
                    },
                    duration: 5000,
                });
            } else {
                console.error('❌ createDeal returned null/undefined');
                toast.error('Failed to save product - no result returned');
            }
        } catch (error) {
            console.error('❌ Error in handleSave:', error);
            toast.error('Failed to save product');
        } finally {
            setIsSaving(false);
        }
    };

    const borderColor = STORE_COLORS[detectedStore];

    return (
        <div className="w-full max-w-3xl mx-auto space-y-6 relative">
            <div className="space-y-4">
                <div
                    className={cn(
                        "relative flex items-center transition-all duration-300 ring-2 rounded-xl bg-background shadow-lg",
                    )}
                    style={{ borderColor: currentUrl ? borderColor : 'transparent' }}
                >
                    <div className="pl-4 text-muted-foreground">
                        <Link className="h-5 w-5" />
                    </div>
                    <Input
                        ref={inputRef}
                        value={currentUrl}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isCustomUrl ? "Paste your custom affiliate link..." : "Paste Amazon, Flipkart, or Myntra link..."}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg h-14 bg-transparent shadow-none"
                    />
                    <div className="pr-2">
                        <Button
                            size="sm"
                            className="h-10 px-6 rounded-lg transition-all"
                            style={{ backgroundColor: currentUrl ? borderColor : undefined }}
                            disabled={!currentUrl || isLoading || isSaving}
                            onClick={async () => {
                                console.log('🚀 Submit button clicked - fetching and saving product');
                                if (currentUrl) {
                                    // First, fetch product details
                                    await setUrl(currentUrl);

                                    // Then auto-save to database
                                    // Wait a bit for state to update
                                    setTimeout(async () => {
                                        if (affiliateUrl) {
                                            await handleSave();
                                        }
                                    }, 500);
                                }
                            }}
                        >
                            {isLoading || isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                {/* Custom URL Toggle */}
                <div className="flex items-center space-x-2 px-2">
                    <Checkbox
                        id="custom-url"
                        checked={isCustomUrl}
                        onCheckedChange={(checked) => setIsCustomUrl(checked as boolean)}
                    />
                    <Label
                        htmlFor="custom-url"
                        className="text-sm text-muted-foreground cursor-pointer select-none"
                    >
                        I have a custom affiliate link (don't generate one)
                    </Label>
                </div>
            </div>

            {currentUrl && !isCustomUrl && (
                <div className="flex justify-between px-2 text-xs font-medium animate-in fade-in slide-in-from-top-1">
                    <span style={{ color: borderColor }}>
                        {detectedStore !== 'other' ? `${detectedStore.charAt(0).toUpperCase() + detectedStore.slice(1)} Detected` : 'Unknown Source'}
                    </span>
                    <span className="text-muted-foreground">
                        Press <kbd className="bg-muted px-1 rounded">Esc</kbd> to clear
                    </span>
                </div>
            )}

            {/* Generated Affiliate Link Section */}
            {affiliateUrl && (
                <div className="animate-in fade-in slide-in-from-top-2 bg-green-500/10 p-4 rounded-xl border border-green-500/20">
                    <label className="text-xs font-medium text-green-600 mb-1.5 block flex items-center gap-2">
                        <Check className="h-3 w-3" /> Product saved! Affiliate link ready
                    </label>
                    <div className="flex gap-2">
                        <Input
                            value={affiliateUrl}
                            readOnly
                            className="bg-background font-mono text-sm h-10 border-green-200 focus-visible:ring-green-500"
                        />
                        <Button onClick={handleCopy} size="icon" className="h-10 w-10 shrink-0 bg-green-600 hover:bg-green-700 text-white" title="Copy to Clipboard">
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            )}

            {/* Missing Config Alert */}
            {missingConfig && !isCustomUrl && (
                <div className="animate-in fade-in slide-in-from-top-2 bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/20 flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-semibold text-yellow-700">Affiliate ID Missing</h4>
                        <p className="text-xs text-yellow-600/80 mt-1">
                            You haven't configured your {detectedStore} affiliate ID yet.
                        </p>
                    </div>
                    <Button size="sm" variant="outline" className="border-yellow-500/30 hover:bg-yellow-500/20 text-yellow-700" asChild>
                        <RouterLink to="/settings">
                            <SettingsIcon className="h-3 w-3 mr-2" />
                            Configure
                        </RouterLink>
                    </Button>
                </div>
            )}
        </div>
    );
}
