import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  User,
  Key,
  Bell,
  Link as LinkIcon,
  MessageCircle,
  Twitter,
  Mail,
  Globe,
  Save,
  Shield,
  Palette,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Check,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/hooks/useProfile';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAffiliatePrograms, AFFILIATE_PROGRAM_CONFIGS } from '@/hooks/useAffiliatePrograms';
import { useTelegram } from '@/hooks/useTelegram';
import { useAuth } from '@/contexts/AuthContext';
import { useApiKeys } from '@/hooks/useApiKeys';
import { useWebhooks } from '@/hooks/useWebhooks';
import { Activity } from 'lucide-react';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { settings, loading: settingsLoading, updateSettings } = useUserSettings();
  const { programs, loading: programsLoading, createProgram, updateProgram, deleteProgram, toggleActive } = useAffiliatePrograms();
  const { channels, addChannel, removeChannel, bots, addBot, removeBot } = useTelegram();
  const { apiKeys, loading: apiKeysLoading, createApiKey, deleteApiKey } = useApiKeys();
  const { webhooks, loading: webhooksLoading, createWebhook, deleteWebhook, toggleActive: toggleWebhook } = useWebhooks();

  const [displayName, setDisplayName] = useState('');
  const [affiliateCode, setAffiliateCode] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [cuelinksApiKey, setCuelinksApiKey] = useState('');
  const [showAddProgramDialog, setShowAddProgramDialog] = useState(false);
  const [showAddChannelDialog, setShowAddChannelDialog] = useState(false);
  const [showAddBotDialog, setShowAddBotDialog] = useState(false); // New State
  const [showAddWebhookDialog, setShowAddWebhookDialog] = useState(false);
  const [newWebhookData, setNewWebhookData] = useState({ url: '', eventTypes: ['price.drop'] });
  const [selectedProgramType, setSelectedProgramType] = useState('');
  const [newBotData, setNewBotData] = useState({ name: '', token: '' }); // New State
  const [newProgramData, setNewProgramData] = useState({
    affiliate_id: '',
    api_key: '',
    api_secret: '',
    commission_rate: '',
  });
  const [newChannelData, setNewChannelData] = useState({
    chatId: '',
    name: '',
    type: 'channel' as 'channel' | 'group' | 'private',
    botId: '', // New Field
  });
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null); // New State
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
  });

  const [linkCloaking, setLinkCloaking] = useState(false); // New State

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
    }
    if (settings) {
      setAffiliateCode(settings.default_affiliate_code || '');
      setTimezone(settings.timezone || 'Asia/Kolkata');
      setCuelinksApiKey(settings.cuelinks_api_key || '');
      if (settings.notification_preferences) {
        // Safe cast to any to access dynamic properties
        const prefs = settings.notification_preferences as any;
        setNotifications({
          email: prefs.email ?? true,
          push: prefs.push ?? true,
        });
        setLinkCloaking(prefs.cloaking ?? false);
      }
    }
  }, [profile, settings]);

  const handleLinkCloakingChange = async (checked: boolean) => {
    setLinkCloaking(checked);
    // Update settings immediately (or debounced, but immediate is fine for toggle)
    // We need to preserve other preferences
    const currentPrefs = settings?.notification_preferences as any || {};
    await updateSettings({
      notification_preferences: {
        ...currentPrefs,
        cloaking: checked,
        // Ensure standard keys exist too if they were missing
        email: notifications.email,
        push: notifications.push
      }
    });
    // Toast is handled by updateSettings
  };

  const handleAddBot = () => {
    if (!newBotData.name || !newBotData.token) {
      toast.error('Please fill in Name and Token');
      return;
    }
    const result = addBot(newBotData.name, newBotData.token);
    if (result) {
      setShowAddBotDialog(false);
      setNewBotData({ name: '', token: '' });
    }
  };

  const handleSaveProfile = async () => {
    await updateProfile({ display_name: displayName });
    await updateSettings({
      default_affiliate_code: affiliateCode,
      timezone,
      notification_preferences: notifications,
    });
    toast.success('Settings saved successfully!');
  };

  const handleSaveApiSettings = async () => {
    await updateSettings({ cuelinks_api_key: cuelinksApiKey });
    toast.success('API settings saved!');
  };

  const handleCreateApiKey = async () => {
    const result = await createApiKey(`API Key ${apiKeys.length + 1}`);
    if (result) {
      setNewlyCreatedKey(result.secretKey);
    }
  };

  const handleAddProgram = async () => {
    if (!selectedProgramType) {
      toast.error('Please select a program');
      return;
    }

    const config = AFFILIATE_PROGRAM_CONFIGS[selectedProgramType as keyof typeof AFFILIATE_PROGRAM_CONFIGS];
    if (!config) {
      toast.error('Invalid program type');
      return;
    }

    await createProgram({
      ...config,
      affiliate_id: newProgramData.affiliate_id,
      api_key: newProgramData.api_key || undefined,
      api_secret: newProgramData.api_secret || undefined,
      commission_rate: newProgramData.commission_rate ? parseFloat(newProgramData.commission_rate) : config.commission_rate,
    });

    setShowAddProgramDialog(false);
    setSelectedProgramType('');
    setNewProgramData({
      affiliate_id: '',
      api_key: '',
      api_secret: '',
      commission_rate: '',
    });
  };

  const handleAddChannel = () => {
    if (!newChannelData.chatId || !newChannelData.name || !newChannelData.botId) {
      toast.error('Please fill in all fields including Bot');
      return;
    }

    const success = addChannel(newChannelData);
    if (success) {
      setShowAddChannelDialog(false);
      setNewChannelData({ chatId: '', name: '', type: 'channel', botId: '' });
    }
  };

  const handleAddWebhook = async () => {
    if (!newWebhookData.url) {
      toast.error('Please enter a webhook URL');
      return;
    }
    const result = await createWebhook(newWebhookData.url, newWebhookData.eventTypes);
    if (result) {
      setShowAddWebhookDialog(false);
      setNewWebhookData({ url: '', eventTypes: ['price.drop'] });
    }
  };

  const loading = profileLoading || settingsLoading;

  return (
    <AppLayout title="Settings" description="Manage your account and preferences">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="affiliate">Affiliate Programs</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="affiliateCode">Default Affiliate Code</Label>
                    <Input
                      id="affiliateCode"
                      value={affiliateCode}
                      onChange={(e) => setAffiliateCode(e.target.value)}
                      placeholder="your-affiliate-id"
                    />
                    <p className="text-xs text-muted-foreground">
                      This code will be used when no specific affiliate program is configured
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                        <SelectItem value="Asia/Singapore">Asia/Singapore (SGT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSaveProfile} className="gradient-primary">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline">Change Password</Button>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="affiliate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Link Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Link Cloaking</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically remove tracking parameters (utm_*, ref, etc.) from destination URLs.
                  </p>
                </div>
                <Switch
                  checked={linkCloaking}
                  onCheckedChange={handleLinkCloakingChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Affiliate Programs
              </CardTitle>
              <Dialog open={showAddProgramDialog} onOpenChange={setShowAddProgramDialog}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Program
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Affiliate Program</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Select Program</Label>
                      <Select value={selectedProgramType} onValueChange={setSelectedProgramType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a program" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(AFFILIATE_PROGRAM_CONFIGS).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedProgramType && (
                      <>
                        <div className="space-y-2">
                          <Label>Affiliate ID / Tag *</Label>
                          <Input
                            value={newProgramData.affiliate_id}
                            onChange={(e) => setNewProgramData({ ...newProgramData, affiliate_id: e.target.value })}
                            placeholder="Your affiliate tracking ID"
                          />
                          <p className="text-xs text-muted-foreground">
                            This is the ID that will be added to your affiliate links
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label>API Key (Optional)</Label>
                          <Input
                            type="password"
                            value={newProgramData.api_key}
                            onChange={(e) => setNewProgramData({ ...newProgramData, api_key: e.target.value })}
                            placeholder="For advanced integrations"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Commission Rate %</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={newProgramData.commission_rate}
                            onChange={(e) => setNewProgramData({ ...newProgramData, commission_rate: e.target.value })}
                            placeholder={String(AFFILIATE_PROGRAM_CONFIGS[selectedProgramType as keyof typeof AFFILIATE_PROGRAM_CONFIGS]?.commission_rate || '')}
                          />
                        </div>
                      </>
                    )}
                    <Button
                      onClick={handleAddProgram}
                      className="w-full"
                      disabled={!selectedProgramType || !newProgramData.affiliate_id}
                    >
                      Add Program
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {programsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : programs.length === 0 ? (
                <div className="text-center py-8">
                  <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Affiliate Programs</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Add your affiliate programs to automatically convert links
                  </p>
                  <Button onClick={() => setShowAddProgramDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Program
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {programs.map((program) => (
                    <div
                      key={program.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <LinkIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{program.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            ID: {program.affiliate_id || 'Not set'} • {program.commission_rate}% commission
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="secondary"
                          className={program.is_active ? 'bg-success/10 text-success' : 'bg-muted'}
                        >
                          {program.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Switch
                          checked={program.is_active}
                          onCheckedChange={() => toggleActive(program.id)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteProgram(program.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Supported Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(AFFILIATE_PROGRAM_CONFIGS).map(([key, config]) => {
                  const isAdded = programs.some(p => p.program_type === key);
                  return (
                    <div
                      key={key}
                      className={`p-4 rounded-lg border text-center ${isAdded ? 'border-success bg-success/5' : 'border-dashed'}`}
                    >
                      <p className="font-medium text-sm">{config.name}</p>
                      <p className="text-xs text-muted-foreground">{config.commission_rate}% avg</p>
                      {isAdded && (
                        <Badge variant="secondary" className="mt-2 bg-success/10 text-success">
                          <Check className="h-3 w-3 mr-1" />
                          Added
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Developer API Keys
              </CardTitle>
              <Button onClick={() => handleCreateApiKey()} className="gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Create New Key
              </Button>
            </CardHeader>
            <CardContent>
              {apiKeysLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : apiKeys.length === 0 ? (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No API Keys</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Create an API key to access the LinkGenie API programmatically
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{key.name}</h3>
                          <Badge variant={key.is_active ? "secondary" : "destructive"} className="text-xs">
                            {key.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-mono mt-1">
                          {key.key_prefix}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created: {new Date(key.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteApiKey(key.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Webhooks
              </CardTitle>
              <Dialog open={showAddWebhookDialog} onOpenChange={setShowAddWebhookDialog}>
                <DialogTrigger asChild>
                  <Button className="gradient-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Webhook
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Webhook</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="webhookUrl">Webhook URL</Label>
                      <Input
                        id="webhookUrl"
                        value={newWebhookData.url}
                        onChange={(e) => setNewWebhookData({ ...newWebhookData, url: e.target.value })}
                        placeholder="https://api.yoursite.com/webhook"
                      />
                      <p className="text-xs text-muted-foreground">
                        We will send POST requests to this URL for events like price drops.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Events</Label>
                      <div className="flex items-center space-x-2">
                        <Switch checked={true} disabled />
                        <span className="text-sm">Price Drops (Default)</span>
                      </div>
                    </div>
                    <Button onClick={handleAddWebhook} className="w-full">
                      Add Webhook
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {webhooksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : webhooks.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Webhooks</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Add a webhook to receive real-time notifications
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {webhooks.map((hook) => (
                    <div key={hook.id} className="p-4 rounded-lg border bg-card">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs">POST</Badge>
                          <span className="font-medium text-sm truncate max-w-[200px] md:max-w-md" title={hook.url}>
                            {hook.url}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={hook.is_active}
                            onCheckedChange={(checked) => toggleWebhook(hook.id, checked)}
                          />
                          <Button variant="ghost" size="icon" onClick={() => deleteWebhook(hook.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Secret: <code className="bg-muted px-1 rounded">{(hook.secret_key || '').substring(0, 10)}...</code></span>
                        <span>Events: {hook.events.join(', ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Cuelinks Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cuelinkApiKey">Cuelinks API Key</Label>
                <Input
                  id="cuelinkApiKey"
                  type="password"
                  value={cuelinksApiKey}
                  onChange={(e) => setCuelinksApiKey(e.target.value)}
                  placeholder="Enter your Cuelinks API key"
                />
              </div>
              <Button onClick={handleSaveApiSettings} className="gradient-primary">
                <Save className="h-4 w-4 mr-2" />
                Save Cuelinks Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Short URL Domain
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customDomain">Custom Domain</Label>
                <Input id="customDomain" placeholder="yoursite.link" />
                <p className="text-xs text-muted-foreground">
                  Set up a custom domain for your short URLs
                </p>
              </div>
              <Button variant="outline">Verify Domain</Button>
            </CardContent>
          </Card>

          {/* Dialog for showing new key */}
          <Dialog open={!!newlyCreatedKey} onOpenChange={(open) => !open && setNewlyCreatedKey(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>API Key Created</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm text-muted-foreground">
                  Save this key now. You won't be able to see it again!
                </p>
                <div className="p-4 bg-muted rounded-lg break-all font-mono text-sm border border-primary/20">
                  {newlyCreatedKey}
                </div>
                <Button onClick={() => setNewlyCreatedKey(null)} className="w-full">
                  Done
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="platforms" className="space-y-6">
          {/* Telegram Bot Configuration */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-blue-500" />
                Telegram Channels
              </CardTitle>
              <Button className="gradient-primary" onClick={() => setShowAddChannelDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Channel
              </Button>
              <Dialog open={showAddChannelDialog} onOpenChange={setShowAddChannelDialog}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Telegram Channel</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    {bots.length === 0 && (
                      <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm border border-destructive/20">
                        <strong>No Bots Found.</strong> Please close this popup and add a bot in the 'Connected Bots' section first.
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Select Bot</Label>
                      <Select
                        disabled={bots.length === 0}
                        value={newChannelData.botId}
                        onValueChange={(value) => setNewChannelData({ ...newChannelData, botId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a bot" />
                        </SelectTrigger>
                        <SelectContent>
                          {bots.map((bot) => (
                            <SelectItem key={bot.id} value={bot.id}>{bot.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Channel Name</Label>
                      <Input
                        value={newChannelData.name}
                        onChange={(e) => setNewChannelData({ ...newChannelData, name: e.target.value })}
                        placeholder="My Deals Channel"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Chat ID</Label>
                      <Input
                        value={newChannelData.chatId}
                        onChange={(e) => setNewChannelData({ ...newChannelData, chatId: e.target.value })}
                        placeholder="-1001234567890 or @channelname"
                      />
                      <p className="text-xs text-muted-foreground">
                        Use @userinfobot on Telegram to get your channel's Chat ID
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={newChannelData.type}
                        onValueChange={(value: 'channel' | 'group' | 'private') =>
                          setNewChannelData({ ...newChannelData, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="channel">Channel</SelectItem>
                          <SelectItem value="group">Group</SelectItem>
                          <SelectItem value="private">Private Chat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleAddChannel}
                      className="w-full"
                      disabled={!newChannelData.chatId || !newChannelData.name || !newChannelData.botId}
                    >
                      Add Channel
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">Connected Bots</h3>
                  <Dialog open={showAddBotDialog} onOpenChange={setShowAddBotDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Bot
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Telegram Bot</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Bot Name</Label>
                          <Input
                            value={newBotData.name}
                            onChange={(e) => setNewBotData({ ...newBotData, name: e.target.value })}
                            placeholder="My Deal Bot"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Bot Token</Label>
                          <Input
                            type="password"
                            value={newBotData.token}
                            onChange={(e) => setNewBotData({ ...newBotData, token: e.target.value })}
                            placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                          />
                          <p className="text-xs text-muted-foreground">
                            Get this from @BotFather
                          </p>
                        </div>
                        <Button onClick={handleAddBot} className="w-full">
                          Save Bot
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {bots.length === 0 ? (
                  <div className="p-4 border rounded-lg bg-muted/50 text-center text-sm text-muted-foreground">
                    No bots added. Add a bot first to connect channels.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bots.map((bot) => (
                      <div key={bot.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded">
                            <MessageCircle className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{bot.name}</p>
                            <p className="text-xs text-muted-foreground">Token ends with ...{bot.token.slice(-5)}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeBot(bot.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {channels.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No Telegram Channels</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Add your Telegram channels to automatically post deals
                  </p>
                  <Button onClick={() => setShowAddChannelDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Channel
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {channels.map((channel) => (
                    <div
                      key={channel.chatId}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                          <MessageCircle className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{channel.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {channel.chatId} • {channel.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="bg-success/10 text-success">
                          Connected
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeChannel(channel.chatId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <h4 className="font-medium text-sm mb-2">How to set up Telegram Bot</h4>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Create a bot with @BotFather and get the token</li>
                  <li>Add the bot to your channel as an administrator</li>
                  <li>Get your channel's Chat ID using @userinfobot</li>
                  <li>Add the channel here with the Chat ID</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Other Platforms */}
          {[
            { name: 'Twitter/X', icon: Twitter, color: 'bg-foreground', connected: false },
            { name: 'Discord', icon: MessageCircle, color: 'bg-indigo-500', connected: false },
            { name: 'WhatsApp Business', icon: MessageCircle, color: 'bg-green-500', connected: false },
            { name: 'Email (Newsletter)', icon: Mail, color: 'bg-primary', connected: false },
          ].map((platform) => (
            <Card key={platform.name}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${platform.color}`}>
                      <platform.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{platform.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {platform.connected
                          ? 'Connected and ready to share'
                          : 'Coming soon'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant="secondary"
                      className="bg-muted text-muted-foreground"
                    >
                      Coming Soon
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive updates via email
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, email: checked }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Browser push notifications
                  </p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, push: checked }))
                  }
                />
              </div>
              <Separator />
              <Button onClick={handleSaveProfile}>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Toggle between light and dark theme
                  </p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Language & Region
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="ta">Tamil</SelectItem>
                    <SelectItem value="te">Telugu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select defaultValue="inr">
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inr">₹ INR (Indian Rupee)</SelectItem>
                    <SelectItem value="usd">$ USD (US Dollar)</SelectItem>
                    <SelectItem value="eur">€ EUR (Euro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
