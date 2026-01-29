import { useContentStudio } from '@/store/useContentStudio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MessageCircle, Send } from 'lucide-react';

export default function SocialPreview() {
    const { socialCopy, setSocialCopy, productDetails, clearCurrentSession } = useContentStudio();

    // Mock data if no product details yet
    const displayTitle = productDetails?.title || "Product Title Will Appear Here";
    const displayPrice = productDetails?.currentPrice || "₹0";
    const displayImage = productDetails?.image || "https://placehold.co/400x400?text=Product+Image";

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Configuration */}
            <Card>
                <CardHeader>
                    <CardTitle>Customize Post</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Hook Line</Label>
                        <Input
                            value={socialCopy.hook}
                            onChange={(e) => setSocialCopy('hook', e.target.value)}
                            placeholder="e.g. Lowest Price Ever!"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Call to Action</Label>
                        <Input
                            value={socialCopy.cta}
                            onChange={(e) => setSocialCopy('cta', e.target.value)}
                            placeholder="e.g. Buy Now"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Live Preview */}
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Live Preview</h3>
                <Tabs defaultValue="telegram" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="telegram">Telegram</TabsTrigger>
                        <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                    </TabsList>

                    <TabsContent value="telegram">
                        {/* Telegram-style card */}
                        <div className="bg-[#1c2936] p-3 rounded-lg max-w-sm mx-auto shadow-xl text-white font-sans text-sm relative">
                            {/* Image */}
                            <div className="rounded overflow-hidden mb-2 bg-white">
                                <img src={displayImage} alt="Product" className="w-full h-48 object-contain" />
                            </div>

                            {/* Text Content */}
                            <div className="space-y-1">
                                <p className="font-bold text-[#5eb5f7]">{socialCopy.hook}</p>
                                <p className="line-clamp-2">{displayTitle}</p>
                                <p className="font-bold text-lg">Price: {displayPrice}</p>
                                <div className="mt-2 text-[#5eb5f7] hover:underline cursor-pointer">
                                    {socialCopy.cta} 🔗 [Link]
                                </div>
                            </div>

                            {/* Timestamp/Meta */}
                            <div className="flex justify-end mt-1 text-[10px] text-gray-400">
                                12:00 PM
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="whatsapp">
                        {/* WhatsApp-style card */}
                        <div className="bg-[#e5ddd5] p-3 rounded-lg max-w-sm mx-auto shadow-xl font-sans text-sm relative min-h-[300px]">
                            <div className="bg-white p-1 rounded-lg shadow-sm rounded-tr-none ml-auto max-w-[90%]">
                                <div className="rounded overflow-hidden mb-1 bg-gray-100">
                                    <img src={displayImage} alt="Product" className="w-full h-40 object-contain" />
                                </div>
                                <div className="px-1">
                                    <p className="font-bold">{socialCopy.hook}</p>
                                    <p className="line-clamp-2 text-gray-800">{displayTitle}</p>
                                    <p className="font-bold">Deal Price: {displayPrice}</p>
                                    <p className="text-blue-500 mt-1">{socialCopy.cta}: bit.ly/example</p>
                                </div>
                                <div className="text-[10px] text-gray-500 text-right mt-1">12:00 PM</div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
