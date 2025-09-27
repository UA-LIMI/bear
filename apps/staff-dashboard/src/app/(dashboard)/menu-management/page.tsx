import { getMenuItemsFixture } from '@/lib/fixtures';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function MenuManagementPage() {
  const menuItems = getMenuItemsFixture();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-semibold">Menu catalog</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage availability, pricing, and dietary attributes for in-room dining.
            </p>
          </div>
          <Button size="sm" variant="secondary">
            Add menu item
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {menuItems.map(item => (
            <div key={item.id} className="flex flex-col gap-3 rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.available ? 'default' : 'secondary'}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </Badge>
                  <span className="font-semibold text-lg">${item.price.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {item.allergens.length > 0 ? (
                  item.allergens.map(allergen => (
                    <Badge key={allergen} variant="outline">
                      {allergen}
                    </Badge>
                  ))
                ) : (
                  <span>No allergens</span>
                )}
                <Separator orientation="vertical" className="h-4" />
                <span>{item.dietaryInfo}</span>
              </div>
              {/* TODO: Implement inline editing with optimistic updates and image management. */}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
