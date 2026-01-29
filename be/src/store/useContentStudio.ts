import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Store, detectStore } from '@/lib/urlParser';
import { supabase } from '@/integrations/supabase/client';

export interface HistoryItem {
    id: string;
    originalUrl: string;
    affiliateUrl: string;
    title?: string;
    store: Store;
    createdAt: number;
}

interface ContentStudioState {
    currentUrl: string;
    detectedStore: Store;
    isLoading: boolean;
    productDetails: {
        title: string;
        image: string;
        currentPrice: string;
        originalPrice: string;
    } | null;
    socialCopy: {
        hook: string;
        cta: string;
    };
    history: HistoryItem[];

    // Actions
    setUrl: (url: string) => void;
    setProductDetails: (details: any) => void;
    setSocialCopy: (field: 'hook' | 'cta', value: string) => void;
    addToHistory: (item: Omit<HistoryItem, 'id' | 'createdAt'>) => void;
    removeFromHistory: (id: string) => void;
    clearCurrentSession: () => void;
}

export const useContentStudio = create<ContentStudioState>()(
    persist(
        (set, get) => ({
            currentUrl: '',
            detectedStore: 'other',
            isLoading: false,
            productDetails: null,
            socialCopy: {
                hook: '🔥 Lowest Price Ever!',
                cta: 'Check Deal',
            },
            history: [],

            setUrl: async (url) => {
                const store = detectStore(url);
                set({ currentUrl: url, detectedStore: store });

                if (!url) {
                    set({ productDetails: null });
                    return;
                }

                set({ isLoading: true });

                try {
                    console.log('🔍 Extracting product details from URL:', url);

                    // Initial basic fallback (sync)
                    let productDetails = {
                        title: 'Product from ' + store.charAt(0).toUpperCase() + store.slice(1),
                        image: 'https://placehold.co/400x400?text=Product+Image',
                        currentPrice: '',
                        originalPrice: '',
                    };

                    // Try Extraction via Edge Function
                    try {
                        const { data: result, error } = await supabase.functions.invoke('scrape-product', {
                            body: { url }
                        });

                        if (error) throw error;

                        console.log('📦 Scraped product data:', result);

                        if (result.success && result.data) {
                            productDetails = {
                                title: result.data.title || productDetails.title,
                                image: result.data.image || productDetails.image,
                                currentPrice: result.data.currentPrice || '',
                                originalPrice: result.data.originalPrice || ''
                            };
                        }
                    } catch (scrapingError) {
                        console.warn('⚠️ Scraping failed, using basic fallback:', scrapingError);
                        // Make sure we at least have a somewhat valid object from the basic fallback
                    }

                    // Extract ID for image fallback if scraping totally failed and we have no image
                    if ((!productDetails.image || productDetails.image.includes('placehold')) && store === 'amazon') {
                        const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})|\/gp\/product\/([A-Z0-9]{10})/);
                        const asin = asinMatch?.[1] || asinMatch?.[2];
                        if (asin) productDetails.image = `https://m.media-amazon.com/images/I/${asin}._SL1500_.jpg`;
                    }

                    set({
                        productDetails,
                        isLoading: false,
                        socialCopy: {
                            hook: '🔥 Amazing deal alert!',
                            cta: 'Grab it now'
                        }
                    });

                } catch (error) {
                    console.error('❌ Error processing URL:', error);
                    set({
                        productDetails: {
                            title: `Product from ${store}`,
                            image: 'https://placehold.co/400x400?text=Error',
                            currentPrice: '',
                            originalPrice: ''
                        },
                        isLoading: false,
                        socialCopy: {
                            hook: '🔥 Check out this deal!',
                            cta: 'Grab it now'
                        }
                    });
                }
            },

            setProductDetails: (details) => set({ productDetails: details }),

            setSocialCopy: (field, value) =>
                set((state) => ({
                    socialCopy: { ...state.socialCopy, [field]: value }
                })),

            addToHistory: (item) =>
                set((state) => ({
                    history: [
                        { ...item, id: crypto.randomUUID(), createdAt: Date.now() },
                        ...state.history.slice(0, 19), // Keep last 20
                    ],
                })),

            removeFromHistory: (id) =>
                set((state) => ({
                    history: state.history.filter((item) => item.id !== id),
                })),

            clearCurrentSession: () => set({
                currentUrl: '',
                detectedStore: 'other',
                productDetails: null,
                socialCopy: { hook: '🔥 Lowest Price Ever!', cta: 'Check Deal' }
            })
        }),
        {
            name: 'content-studio-storage',
            partialize: (state) => ({ history: state.history }), // Only persist history
        }
    )
);
