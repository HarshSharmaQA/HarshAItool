
import { getSettings, getContactSettings, getWhatsappSettings, getMarqueeSettings, getNotificationPopupSettings } from "@/lib/data";
import SettingsForm from "@/app/admin/(protected)/settings/(forms)/settings-form";
import ContactSettingsForm from "@/app/admin/(protected)/settings/(forms)/contact-settings-form";
import WhatsappSettingsForm from "@/app/admin/(protected)/settings/(forms)/whatsapp-settings-form";
import MarqueeSettingsForm from "@/app/admin/(protected)/settings/(forms)/marquee-settings-form";
import ThemeSettingsForm from "@/app/admin/(forms)/theme-settings-form";
import NotificationPopupSettingsForm from "../(forms)/notification-popup-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2, Palette, Phone, MessageCircle, Megaphone, Bell } from "lucide-react";

export const metadata = {
  title: "Global Settings",
};

export default async function GlobalSettingsPage() {
  const [
    settings,
    contactSettings,
    whatsappSettings,
    marqueeSettings,
    notificationPopupSettings,
  ] = await Promise.all([
    getSettings(),
    getContactSettings(),
    getWhatsappSettings(),
    getMarqueeSettings(),
    getNotificationPopupSettings(),
  ]);

  // Ensure marqueeSettings has a proper default structure
  const safeMarqueeSettings = marqueeSettings && typeof marqueeSettings === 'object'
    ? {
      enabled: marqueeSettings.enabled ?? false,
      speed: marqueeSettings.speed ?? 25,
      direction: marqueeSettings.direction ?? 'left',
      items: Array.isArray(marqueeSettings.items) && marqueeSettings.items.length > 0
        ? marqueeSettings.items
        : [{ id: '1', text: 'Default marquee item', icon: undefined }]
    }
    : {
      enabled: false,
      speed: 25,
      direction: 'left' as 'left' | 'right' | undefined,
      items: [{ id: '1', text: 'Default marquee item', icon: undefined }]
    };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Global Settings</h1>
        <p className="text-muted-foreground">
          Manage your website's global configuration, appearance, and integrations.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full space-y-6">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="w-full justify-start inline-flex h-auto p-1 bg-muted/50">
            <TabsTrigger value="general" className="py-2 px-4 gap-2">
              <Settings2 className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="appearance" className="py-2 px-4 gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="contact" className="py-2 px-4 gap-2">
              <Phone className="h-4 w-4" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="py-2 px-4 gap-2">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="marquee" className="py-2 px-4 gap-2">
              <Megaphone className="h-4 w-4" />
              Marquee
            </TabsTrigger>
            <TabsTrigger value="popup" className="py-2 px-4 gap-2">
              <Bell className="h-4 w-4" />
              Popup
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="space-y-6 animate-in fade-in-50 duration-300">
          <SettingsForm settings={settings} />
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6 animate-in fade-in-50 duration-300">
          <ThemeSettingsForm settings={settings} />
        </TabsContent>

        <TabsContent value="contact" className="space-y-6 animate-in fade-in-50 duration-300">
          <ContactSettingsForm settings={contactSettings} />
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-6 animate-in fade-in-50 duration-300">
          <WhatsappSettingsForm settings={whatsappSettings} />
        </TabsContent>

        <TabsContent value="marquee" className="space-y-6 animate-in fade-in-50 duration-300">
          <MarqueeSettingsForm settings={safeMarqueeSettings} />
        </TabsContent>

        <TabsContent value="popup" className="space-y-6 animate-in fade-in-50 duration-300">
          <NotificationPopupSettingsForm settings={notificationPopupSettings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
