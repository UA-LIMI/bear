import { getGuestProfilesFixture } from '@/lib/fixtures';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function GuestProfilesPage() {
  const guests = getGuestProfilesFixture();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Guest profiles</CardTitle>
          <p className="text-sm text-muted-foreground">
            Access preferences, visit history, and AI-generated insights.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {guests.map(guest => (
            <div key={guest.id} className="flex flex-col gap-3 rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={guest.photo} alt={guest.name} />
                  <AvatarFallback>{getInitials(guest.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold leading-tight">{guest.name}</span>
                  <span className="text-sm text-muted-foreground">{guest.vipStatus} member</span>
                </div>
                <Badge variant="secondary" className="ml-auto">Visits: {guest.visitCount}</Badge>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground">
                <p>Email: {guest.email}</p>
                <p>Phone: {guest.phone}</p>
                <p>Last stay: {guest.lastVisit ?? 'N/A'}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {guest.preferences.dining.map(pref => (
                  <Badge key={pref} variant="outline">
                    {pref}
                  </Badge>
                ))}
              </div>
              {/* TODO: Add AI insight cards summarizing spending and recommended actions. */}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
