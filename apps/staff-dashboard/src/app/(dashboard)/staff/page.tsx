import { getStaffProfilesFixture } from '@/lib/fixtures';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

const getInitials = (name: string) =>
  name
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function StaffPage() {
  const staffMembers = getStaffProfilesFixture();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Staff roster</CardTitle>
          <p className="text-sm text-muted-foreground">
            Review on-duty team members, skills, and performance metrics.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {staffMembers.map(member => (
            <div key={member.id} className="flex flex-col gap-4 rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.photo} alt={member.name} />
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold leading-tight">{member.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {member.position} · {member.department}
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Guest satisfaction</span>
                  <span>{member.metrics.guestSatisfaction}%</span>
                </div>
                <Progress value={member.metrics.guestSatisfaction} />
                <div className="flex justify-between text-muted-foreground">
                  <span>Task efficiency</span>
                  <span>{member.metrics.taskEfficiency}%</span>
                </div>
                <Progress value={member.metrics.taskEfficiency} />
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {member.skills.slice(0, 3).map(skill => (
                  <span key={skill.name} className="rounded-md border px-2 py-1">
                    {skill.name}
                  </span>
                ))}
                {/* TODO: surface AI-driven recommendations for scheduling and workload balancing. */}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
