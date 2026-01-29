import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export interface TelegramBot {
  id: string;
  name: string;
  token: string;
}

export interface TelegramChannel {
  chatId: string;
  name: string;
  type: 'channel' | 'group' | 'private';
  botId: string;
}

export function useTelegram() {
  const [loading, setLoading] = useState(false);

  const [bots, setBots] = useState<TelegramBot[]>(() => {
    const saved = localStorage.getItem('telegram_bots');
    // Migration from old single token
    const oldToken = localStorage.getItem('telegram_bot_token');
    if (oldToken && !saved) {
      const defaultBot = { id: 'default', name: 'Default Bot', token: oldToken };
      return [defaultBot];
    }
    return saved ? JSON.parse(saved) : [];
  });

  const [channels, setChannels] = useState<TelegramChannel[]>(() => {
    const saved = localStorage.getItem('telegram_channels');
    let parsed = saved ? JSON.parse(saved) : [];
    // Migration: ensure botId exists
    if (parsed.length > 0 && !parsed[0].botId) {
      const oldToken = localStorage.getItem('telegram_bot_token');
      const defaultBotId = 'default';
      parsed = parsed.map((c: any) => ({ ...c, botId: defaultBotId }));
    }
    return parsed;
  });

  const saveBots = (newBots: TelegramBot[]) => {
    localStorage.setItem('telegram_bots', JSON.stringify(newBots));
    setBots(newBots);
  };

  const saveChannels = (newChannels: TelegramChannel[]) => {
    localStorage.setItem('telegram_channels', JSON.stringify(newChannels));
    setChannels(newChannels);
  };

  const addBot = (name: string, token: string) => {
    const newBot = { id: uuidv4(), name, token };
    const newBots = [...bots, newBot];
    saveBots(newBots);
    toast.success('Bot added successfully');
    return newBot.id;
  };

  const removeBot = (id: string) => {
    const newBots = bots.filter(b => b.id !== id);
    saveBots(newBots);
    // Also remove or unlink channels? Let's keep them but alert if used?
    // Better to just remove channels linked to this bot
    const newChannels = channels.filter(c => c.botId !== id);
    saveChannels(newChannels);
    toast.success('Bot and linked channels removed');
  };

  const addChannel = (channel: TelegramChannel) => {
    const existing = channels.find(c => c.chatId === channel.chatId && c.botId === channel.botId);
    if (existing) {
      toast.error('Channel already added for this bot');
      return false;
    }
    const newChannels = [...channels, channel];
    saveChannels(newChannels);
    toast.success('Channel added successfully!');
    return true;
  };

  const removeChannel = (chatId: string) => {
    const newChannels = channels.filter(c => c.chatId !== chatId);
    saveChannels(newChannels);
    toast.success('Channel removed');
  };

  const sendMessage = async (chatId: string, message: string, parseMode: 'HTML' | 'Markdown' = 'HTML', specificBotId?: string) => {
    setLoading(true);
    try {
      // Find the channel to get the botId
      const channel = channels.find(c => c.chatId === chatId);
      const botId = specificBotId || channel?.botId;

      const bot = bots.find(b => b.id === botId);

      if (!bot) {
        throw new Error('Bot configurations not found for this channel');
      }

      const { data, error } = await supabase.functions.invoke('telegram-post', {
        body: {
          chatId,
          message,
          parseMode,
          botToken: bot.token,
        },
      });

      if (error) {
        console.error('Error sending Telegram message:', error);
        toast.error('Failed to send: ' + (error.message || 'Unknown network error'));
        return null;
      }

      if (data && !data.success) {
        console.error('Telegram API error:', data.error);
        toast.error('Failed: ' + (data.error || 'Unknown API error'));
        return null;
      }

      toast.success('Message sent to Telegram!');
      return data;
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to send message');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const broadcastToAllChannels = async (message: string, parseMode: 'HTML' | 'Markdown' = 'HTML') => {
    if (channels.length === 0) {
      toast.error('No Telegram channels configured');
      return [];
    }

    setLoading(true);
    const results = [];

    for (const channel of channels) {
      const result = await sendMessage(channel.chatId, message, parseMode);
      results.push({ channel, success: !!result, result });
    }

    setLoading(false);

    const successCount = results.filter(r => r.success).length;
    if (successCount === channels.length) {
      toast.success(`Message sent to all ${channels.length} channel(s)`);
    } else if (successCount > 0) {
      toast.warning(`Sent to ${successCount}/${channels.length} channels`);
    }

    return results;
  };

  return {
    bots,
    channels,
    loading,
    addBot,
    removeBot,
    addChannel,
    removeChannel,
    sendMessage,
    broadcastToAllChannels,
  };
}
