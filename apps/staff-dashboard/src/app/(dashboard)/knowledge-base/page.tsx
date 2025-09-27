import { getKnowledgeBaseFixture } from '@/lib/fixtures';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function KnowledgeBasePage() {
  const articles = getKnowledgeBaseFixture();
  const categories = Array.from(new Set(articles.map(article => article.category)));

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Knowledge base</CardTitle>
          <p className="text-sm text-muted-foreground">
            Surface SOPs, localized recommendations, and guest-facing playbooks.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={categories[0] ?? 'All'} className="flex flex-col gap-4">
            <TabsList className="w-full justify-start overflow-x-auto">
              {categories.map(category => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map(category => (
              <TabsContent key={category} value={category} className="flex flex-col gap-3">
                {articles
                  .filter(article => article.category === category)
                  .map(article => (
                    <article key={article.id} className="rounded-lg border p-4">
                      <h3 className="text-lg font-semibold">{article.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        Last updated {new Date(article.lastUpdated).toLocaleDateString()}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {article.content}
                      </p>
                      {/* TODO: Replace placeholder content with markdown renderer and AI summaries. */}
                    </article>
                  ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
