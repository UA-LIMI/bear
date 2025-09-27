import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

const credentialStatus = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKeyConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Supabase configuration</CardTitle>
          <CardDescription>Verify connection credentials and realtime status.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Project URL</span>
            <Badge variant={credentialStatus.supabaseUrl ? 'default' : 'secondary'}>
              {credentialStatus.supabaseUrl ? 'Configured' : 'Missing'}
            </Badge>
            <code className="rounded bg-muted px-2 py-1 text-xs">
              {credentialStatus.supabaseUrl ?? 'NEXT_PUBLIC_SUPABASE_URL not provided'}
            </code>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold">Anon key</span>
            <Badge variant={credentialStatus.anonKeyConfigured ? 'default' : 'secondary'}>
              {credentialStatus.anonKeyConfigured ? 'Configured' : 'Missing'}
            </Badge>
            <p className="text-xs text-muted-foreground">
              Store the anon key in `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client-side access.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure alerting and staff messaging preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium leading-tight">Realtime request alerts</p>
              <p className="text-sm text-muted-foreground">
                Trigger toast notifications when new guest requests arrive.
              </p>
            </div>
            <Switch defaultChecked disabled className="data-[disabled]:opacity-60" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium leading-tight">Escalation emails</p>
              <p className="text-sm text-muted-foreground">
                Send a summary email when high priority requests exceed SLA.
              </p>
            </div>
            <Switch defaultChecked={false} disabled className="data-[disabled]:opacity-60" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Manage AI automation, PMS connections, and IoT controls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium leading-tight">AI concierge agent</p>
              <p className="text-sm text-muted-foreground">
                Automatically summarize guest preferences and suggested actions.
              </p>
            </div>
            <Switch defaultChecked disabled className="data-[disabled]:opacity-60" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium leading-tight">Building management IoT</p>
              <p className="text-sm text-muted-foreground">
                Control HVAC and lighting directly from the room dashboard.
              </p>
            </div>
            <Switch defaultChecked disabled className="data-[disabled]:opacity-60" />
          </div>
          {/* TODO: Wire switches to persisted settings and parity with Supabase config table. */}
        </CardContent>
      </Card>
    </div>
  );
}
