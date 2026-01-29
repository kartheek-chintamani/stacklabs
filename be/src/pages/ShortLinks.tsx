import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShortLinks } from '@/hooks/useShortLinks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Plus,
    Copy,
    ExternalLink,
    Trash2,
    Power,
    QrCode,
    BarChart3,
    Settings,
    Edit2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ShortLinks() {
    const { shortLinks, loading, createShortLink, updateShortLink, deleteShortLink, toggleActive, getShortUrl, generateQRCode } = useShortLinks();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

    const initialFormState = {
        original_url: '',
        custom_code: '',
        title: '',
        description: '',
        password: '',
        expires_at: '',
        device_targeting: { ios: '', android: '', other: '' },
        geo_targeting: { allow: '', block: '' },
    };

    const [formData, setFormData] = useState(initialFormState);

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData(initialFormState);
        setIsDialogOpen(true);
    };

    const handleEdit = (link: any) => {
        setEditingId(link.id);
        setFormData({
            original_url: link.original_url,
            custom_code: link.short_code,
            title: link.title || '',
            description: link.description || '',
            password: link.password || '',
            expires_at: link.expires_at ? link.expires_at.slice(0, 16) : '', // format for datetime-local
            device_targeting: {
                ios: link.device_targeting?.mobile || link.device_targeting?.ios || '',
                android: link.device_targeting?.android || '',
                other: link.device_targeting?.desktop || ''
            },
            geo_targeting: {
                allow: link.geo_targeting?.allow?.join(', ') || '',
                block: link.geo_targeting?.block?.join(', ') || ''
            },
        });
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.original_url) {
            toast.error('Please enter a URL');
            return;
        }

        const payload = {
            ...formData,
            // Only send custom code if creating, or if it's editable (usually short code is immutable or special handling)
            // For now let's assume short_code is editable only if creating? Or allow editing? Supabase policy/logic might restrict.
            // Let's assume editable.
            device_targeting: {
                mobile: formData.device_targeting.android || formData.device_targeting.ios,
                // Logic mapping back to DB structure
                ios: formData.device_targeting.ios,
                android: formData.device_targeting.android
            },
            geo_targeting: {
                allow: formData.geo_targeting.allow ? formData.geo_targeting.allow.split(',').map(s => s.trim()).filter(Boolean) : undefined,
                block: formData.geo_targeting.block ? formData.geo_targeting.block.split(',').map(s => s.trim()).filter(Boolean) : undefined
            }
        };

        if (editingId) {
            const result = await updateShortLink(editingId, {
                original_url: payload.original_url,
                title: payload.title,
                description: payload.description,
                password: payload.password || null,
                expires_at: payload.expires_at || null,
                device_targeting: payload.device_targeting as any, // Fix type issue temporarily
                geo_targeting: payload.geo_targeting as any // Fix type issue temporarily
            });
            if (result) {
                setIsDialogOpen(false);
                setEditingId(null);
            }
        } else {
            // Create
            const result = await createShortLink(payload);
            if (result) {
                setIsDialogOpen(false);
            }
        }
    };

    const handleCopy = (shortCode: string) => {
        const shortUrl = getShortUrl(shortCode);
        navigator.clipboard.writeText(shortUrl);
        toast.success('Link copied to clipboard!');
    };

    const handleShowQR = async (shortCode: string) => {
        const qr = await generateQRCode(shortCode);
        setQrCodeUrl(qr);
    };

    if (loading) {
        return <div className="flex items-center justify-center h-96">Loading...</div>;
    }

    return (
        <div className="container mx-auto py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Short Links</h1>
                    <p className="text-muted-foreground">Create and manage branded short links</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={handleOpenCreate}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Short Link
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Short Link' : 'Create Short Link'}</DialogTitle>
                            <DialogDescription>
                                {editingId ? 'Update details of your short link' : 'Generate a branded short link for your URL'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="original_url">Original URL *</Label>
                                <Input
                                    id="original_url"
                                    placeholder="https://example.com/very/long/url"
                                    value={formData.original_url}
                                    onChange={(e) => setFormData({ ...formData, original_url: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label htmlFor="custom_code">Custom Code (Optional)</Label>
                                <Input
                                    id="custom_code"
                                    placeholder="mydeal"
                                    value={formData.custom_code}
                                    onChange={(e) => setFormData({ ...formData, custom_code: e.target.value })}
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Leave blank for auto-generated code
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="title">Title (Optional)</Label>
                                <Input
                                    id="title"
                                    placeholder="My Amazing Deal"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Input
                                    id="description"
                                    placeholder="Best deal of the season"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="password">Password (Optional)</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Protect link"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="expires_at">Expires At (Optional)</Label>
                                    <Input
                                        id="expires_at"
                                        type="datetime-local"
                                        value={formData.expires_at}
                                        onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 pt-2 border-t text-sm">
                                <Label className="text-base font-semibold">Device Targeting</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="ios_url" className="text-xs">iOS URL</Label>
                                        <Input
                                            id="ios_url"
                                            placeholder="App Store URL"
                                            value={formData.device_targeting.ios}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                device_targeting: { ...formData.device_targeting, ios: e.target.value }
                                            })}
                                            className="h-8"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="android_url" className="text-xs">Android URL</Label>
                                        <Input
                                            id="android_url"
                                            placeholder="Play Store URL"
                                            value={formData.device_targeting.android}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                device_targeting: { ...formData.device_targeting, android: e.target.value }
                                            })}
                                            className="h-8"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-2 border-t text-sm">
                                <Label className="text-base font-semibold">Geo Targeting</Label>
                                <div>
                                    <Label htmlFor="allow_countries" className="text-xs">Allowed Countries (Comma separated, e.g. US, IN, UK)</Label>
                                    <Input
                                        id="allow_countries"
                                        placeholder="US, IN, UK"
                                        value={formData.geo_targeting.allow}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            geo_targeting: { ...formData.geo_targeting, allow: e.target.value }
                                        })}
                                        className="h-8"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="block_countries" className="text-xs">Blocked Countries (Comma separated)</Label>
                                    <Input
                                        id="block_countries"
                                        placeholder="CN, RU"
                                        value={formData.geo_targeting.block}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            geo_targeting: { ...formData.geo_targeting, block: e.target.value }
                                        })}
                                        className="h-8"
                                    />
                                </div>
                            </div>

                            <Button onClick={handleSubmit} className="w-full">
                                {editingId ? 'Update Short Link' : 'Create Short Link'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{shortLinks.length}</div>
                        <p className="text-xs text-muted-foreground">Total Links</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                            {shortLinks.filter((l) => l.is_active).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Active Links</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                            {shortLinks.reduce((sum, link) => sum + (link.click_count || 0), 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">Total Clicks</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                            {shortLinks.filter((l) => (l.click_count || 0) > 0).length}
                        </div>
                        <p className="text-xs text-muted-foreground">Clicked Links</p>
                    </CardContent>
                </Card>
            </div>

            {/* Links List */}
            <div className="space-y-4">
                {shortLinks.length === 0 ? (
                    <Card>
                        <CardContent className="pt-20 pb-20 text-center">
                            <p className="text-muted-foreground mb-4">No short links yet</p>
                            <Button onClick={handleOpenCreate}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Your First Short Link
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    shortLinks.map((link) => (
                        <Card key={link.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold">
                                                {link.title || 'Untitled Link'}
                                            </h3>
                                            {!link.is_active && (
                                                <Badge variant="secondary">Inactive</Badge>
                                            )}
                                            {link.expires_at && new Date(link.expires_at) < new Date() && (
                                                <Badge variant="destructive">Expired</Badge>
                                            )}
                                        </div>

                                        <div className="space-y-1 text-sm">
                                            <div className="flex items-center gap-2">
                                                <code className="bg-muted px-2 py-1 rounded text-primary font-mono">
                                                    {getShortUrl(link.short_code)}
                                                </code>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleCopy(link.short_code)}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                </Button>
                                            </div>

                                            <div className="text-muted-foreground flex items-center gap-1">
                                                <ExternalLink className="h-3 w-3" />
                                                <span className="truncate max-w-xl">{link.original_url}</span>
                                            </div>

                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-xs flex items-center gap-1">
                                                    <BarChart3 className="h-3 w-3" />
                                                    {link.click_count || 0} clicks
                                                </span>
                                                {link.last_clicked_at && (
                                                    <span className="text-xs text-muted-foreground">
                                                        Last clicked: {new Date(link.last_clicked_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleCopy(link.short_code)}
                                            title="Copy Short Link"
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleShowQR(link.short_code)}
                                            title="Show QR Code"
                                        >
                                            <QrCode className="h-4 w-4" />
                                        </Button>
                                        <Link to={`/links/${link.id}/analytics`}>
                                            <Button variant="outline" size="sm" title="View Analytics">
                                                <BarChart3 className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEdit(link)}
                                            title="Edit"
                                        >
                                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleActive(link.id)}
                                            title={link.is_active ? 'Deactivate' : 'Activate'}
                                        >
                                            <Power className={`h-4 w-4 ${link.is_active ? 'text-green-500' : 'text-muted-foreground'}`} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteShortLink(link.id)}
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )
                }
            </div >

            {/* QR Code Dialog */}
            < Dialog open={!!qrCodeUrl} onOpenChange={() => setQrCodeUrl(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>QR Code</DialogTitle>
                        <DialogDescription>
                            Scan this QR code to access the short link
                        </DialogDescription>
                    </DialogHeader>
                    {qrCodeUrl && (
                        <div className="flex justify-center p-4">
                            <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
                        </div>
                    )}
                    <Button onClick={() => setQrCodeUrl(null)}>Close</Button>
                </DialogContent>
            </Dialog >
        </div >
    );
}
