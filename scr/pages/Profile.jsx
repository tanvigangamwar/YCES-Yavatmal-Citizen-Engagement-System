import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, Save, User, MapPin, ThumbsUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import StatusBadge from '@/components/shared/StatusBadge';
import CategoryIcon from '@/components/shared/CategoryIcon';

export default function Profile() {
  const { lang } = useOutletContext() || { lang: 'en' };
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: '', avatar_url: '' });
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setForm({ bio: u?.bio || '', avatar_url: u?.avatar_url || '' });
    }).catch(() => {});
  }, []);

  const { data: allIssues = [], isLoading } = useQuery({
    queryKey: ['profile-issues', user?.email],
    queryFn: () => base44.entities.Issue.list('-created_date', 200),
    enabled: !!user,
  });

  // Issues submitted by the current user
  const myIssues = allIssues.filter(
    (i) => i.reporter_name === user?.full_name || i.created_by === user?.email
  );

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm(prev => ({ ...prev, avatar_url: file_url }));
    setUploadingAvatar(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ bio: form.bio, avatar_url: form.avatar_url });
    setUser(prev => ({ ...prev, bio: form.bio, avatar_url: form.avatar_url }));
    setSaving(false);
    setEditing(false);
    toast.success('Profile updated!');
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const statsData = [
    { label: 'Submitted', value: myIssues.filter(i => i.status === 'submitted').length, color: 'text-amber-600' },
    { label: 'In Progress', value: myIssues.filter(i => i.status === 'in_progress').length, color: 'text-blue-600' },
    { label: 'Resolved', value: myIssues.filter(i => i.status === 'resolved').length, color: 'text-green-600' },
    { label: 'Total', value: myIssues.length, color: 'text-primary' },
  ];

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      {/* Profile Card */}
      <Card className="p-5 border">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <Avatar className="w-20 h-20 border-2 border-border">
              <AvatarImage src={form.avatar_url || user?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {editing && (
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer border-2 border-card shadow">
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                {uploadingAvatar
                  ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                  : <Camera className="w-3.5 h-3.5 text-white" />
                }
              </label>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-foreground truncate">{user?.full_name || 'Citizen'}</h2>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            {!editing && (
              <p className="text-sm text-foreground mt-1.5">
                {user?.bio || <span className="text-muted-foreground italic">No bio yet</span>}
              </p>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-xs shrink-0"
            onClick={() => setEditing(v => !v)}
          >
            {editing ? 'Cancel' : 'Edit'}
          </Button>
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="mt-4 space-y-3 border-t pt-4">
            <div>
              <Label className="text-xs font-medium">Bio</Label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell us about yourself..."
                className="mt-1 text-sm min-h-[70px]"
              />
            </div>
            <Button onClick={handleSave} disabled={saving} size="sm" className="w-full gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Profile
            </Button>
          </div>
        )}
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        {statsData.map(({ label, value, color }) => (
          <Card key={label} className="p-3 border text-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-[10px] text-muted-foreground">{label}</p>
          </Card>
        ))}
      </div>

      {/* My Issues */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          My Reported Issues
          <span className="ml-auto text-xs text-muted-foreground font-normal">{myIssues.length} total</span>
        </h3>

        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <Card key={i} className="p-3 border animate-pulse">
                <div className="h-3 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </Card>
            ))}
          </div>
        ) : myIssues.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <User className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No issues reported yet</p>
            <p className="text-xs mt-1">Issues you report will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {myIssues.map(issue => (
              <Card key={issue.id} className="p-3 border">
                <div className="flex items-start gap-3">
                  <CategoryIcon category={issue.category} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{issue.title}</p>
                      <StatusBadge status={issue.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <MapPin className="w-3 h-3" />{issue.location}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                        <ThumbsUp className="w-3 h-3" />{issue.upvotes || 0}
                      </span>
                    </div>
                    {issue.admin_remarks && (
                      <div className="mt-1.5 p-2 bg-muted rounded text-xs text-foreground">
                        <span className="font-medium text-muted-foreground">Admin: </span>{issue.admin_remarks}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
