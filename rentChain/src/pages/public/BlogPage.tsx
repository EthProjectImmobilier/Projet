import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const BlogPage = () => {
  return (
    <div className="container py-12">
      <Card>
        <CardHeader>
          <CardTitle>Blog</CardTitle>
          <CardDescription>Latest articles and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Blog page coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};
