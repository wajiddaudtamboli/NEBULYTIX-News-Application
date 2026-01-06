import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Save,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  RefreshCw,
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getAdminToken } from '@/lib/api'
import { toast } from '@/hooks/use-toast'

interface SiteSettings {
  siteName: string
  siteTagline: string
  logoUrl: string
  faviconUrl: string
  footerText: string
  copyrightText: string
  socialLinks: {
    facebook: string
    twitter: string
    instagram: string
    linkedin: string
    youtube: string
  }
  contactInfo: {
    email: string
    phone: string
    address: string
  }
  enableNewsletter: boolean
  newsletterTitle: string
  newsletterDescription: string
  metaTitle: string
  metaDescription: string
  maintenanceMode: boolean
  maintenanceMessage: string
}

const defaultSettings: SiteSettings = {
  siteName: 'NEBULYTIX News',
  siteTagline: 'The Future Feed - Your Gateway to Tomorrow',
  logoUrl: '',
  faviconUrl: '',
  footerText: 'Stay informed with the latest news.',
  copyrightText: '© 2026 NEBULYTIX News. All rights reserved.',
  socialLinks: { facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '' },
  contactInfo: { email: '', phone: '', address: '' },
  enableNewsletter: true,
  newsletterTitle: 'Stay Updated',
  newsletterDescription: 'Subscribe for the latest news.',
  metaTitle: 'NEBULYTIX News',
  metaDescription: 'Your comprehensive news source.',
  maintenanceMode: false,
  maintenanceMessage: 'We are currently performing maintenance.',
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/v1/settings')
      const data = await response.json()
      if (data.success && data.data) {
        setSettings({ ...defaultSettings, ...data.data })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = getAdminToken()
      const response = await fetch('/api/v1/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      })

      const data = await response.json()
      if (data.success) {
        toast({ title: 'Settings saved successfully' })
      } else {
        toast({ title: 'Failed to save settings', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Failed to save settings', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  const updateSocialLink = (platform: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }))
  }

  const updateContactInfo = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [field]: value }
    }))
  }

  if (loading) {
    return (
      <AdminLayout title="Settings" subtitle="Configure your site settings">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Settings" subtitle="Configure your site settings">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Site Identity</CardTitle>
                <CardDescription>Basic information about your site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => updateField('siteName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteTagline">Tagline</Label>
                    <Input
                      id="siteTagline"
                      value={settings.siteTagline}
                      onChange={(e) => updateField('siteTagline', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      value={settings.logoUrl}
                      onChange={(e) => updateField('logoUrl', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="faviconUrl">Favicon URL</Label>
                    <Input
                      id="faviconUrl"
                      value={settings.faviconUrl}
                      onChange={(e) => updateField('faviconUrl', e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {settings.logoUrl && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Logo Preview:</p>
                    <img src={settings.logoUrl} alt="Logo" className="h-12 object-contain" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Footer</CardTitle>
                <CardDescription>Footer text and copyright</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="footerText">Footer Text</Label>
                  <Textarea
                    id="footerText"
                    value={settings.footerText}
                    onChange={(e) => updateField('footerText', e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="copyrightText">Copyright Text</Label>
                  <Input
                    id="copyrightText"
                    value={settings.copyrightText}
                    onChange={(e) => updateField('copyrightText', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Newsletter</CardTitle>
                <CardDescription>Newsletter section settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Newsletter</p>
                    <p className="text-sm text-muted-foreground">Show newsletter subscription on homepage</p>
                  </div>
                  <Switch
                    checked={settings.enableNewsletter}
                    onCheckedChange={(checked) => updateField('enableNewsletter', checked)}
                  />
                </div>
                {settings.enableNewsletter && (
                  <>
                    <div>
                      <Label htmlFor="newsletterTitle">Title</Label>
                      <Input
                        id="newsletterTitle"
                        value={settings.newsletterTitle}
                        onChange={(e) => updateField('newsletterTitle', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="newsletterDescription">Description</Label>
                      <Textarea
                        id="newsletterDescription"
                        value={settings.newsletterDescription}
                        onChange={(e) => updateField('newsletterDescription', e.target.value)}
                        rows={2}
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Mode</CardTitle>
                <CardDescription>Take your site offline temporarily</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Maintenance Mode</p>
                    <p className="text-sm text-muted-foreground">Visitors will see a maintenance message</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) => updateField('maintenanceMode', checked)}
                  />
                </div>
                {settings.maintenanceMode && (
                  <div>
                    <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                    <Textarea
                      id="maintenanceMessage"
                      value={settings.maintenanceMessage}
                      onChange={(e) => updateField('maintenanceMessage', e.target.value)}
                      rows={2}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Links */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Connect your social profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'facebook', icon: Facebook, label: 'Facebook' },
                  { key: 'twitter', icon: Twitter, label: 'Twitter / X' },
                  { key: 'instagram', icon: Instagram, label: 'Instagram' },
                  { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
                  { key: 'youtube', icon: Youtube, label: 'YouTube' },
                ].map(({ key, icon: Icon, label }) => (
                  <div key={key} className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1">
                      <Label htmlFor={key}>{label}</Label>
                      <Input
                        id={key}
                        value={settings.socialLinks[key as keyof typeof settings.socialLinks]}
                        onChange={(e) => updateSocialLink(key, e.target.value)}
                        placeholder={`https://${key}.com/...`}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Info */}
          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>How visitors can reach you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.contactInfo.email}
                      onChange={(e) => updateContactInfo('email', e.target.value)}
                      placeholder="contact@example.com"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={settings.contactInfo.phone}
                      onChange={(e) => updateContactInfo('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={settings.contactInfo.address}
                      onChange={(e) => updateContactInfo('address', e.target.value)}
                      placeholder="Street, City, Country"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO */}
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Search engine optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={settings.metaTitle}
                    onChange={(e) => updateField('metaTitle', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {settings.metaTitle.length}/60 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={settings.metaDescription}
                    onChange={(e) => updateField('metaDescription', e.target.value)}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {settings.metaDescription.length}/160 characters
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Search Preview:</p>
                  <div className="space-y-1">
                    <p className="text-blue-600 text-lg">{settings.metaTitle || 'Page Title'}</p>
                    <p className="text-green-700 text-sm">https://nebulytix.com</p>
                    <p className="text-sm text-muted-foreground">{settings.metaDescription || 'Page description...'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
