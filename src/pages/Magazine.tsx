
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Calendar, User, Clock } from 'lucide-react';

const Magazine = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Articles' },
    { id: 'techniques', name: 'Dance Techniques' },
    { id: 'culture', name: 'Stepping Culture' },
    { id: 'events', name: 'Event Coverage' },
    { id: 'interviews', name: 'Interviews' },
    { id: 'fashion', name: 'Fashion & Style' }
  ];

  const articles = [
    {
      id: 1,
      title: "The Evolution of Chicago Stepping: From the 1970s to Today",
      excerpt: "Explore the rich history and cultural significance of Chicago stepping, from its origins in the African American community to its modern-day evolution.",
      author: "Marcus Johnson",
      date: "December 10, 2024",
      readTime: "8 min read",
      category: "culture",
      featured: true,
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Mastering the Turn: Advanced Stepping Techniques",
      excerpt: "Learn the secrets behind smooth, controlled turns that will elevate your stepping game to the next level.",
      author: "Diana Williams",
      date: "December 8, 2024",
      readTime: "6 min read",
      category: "techniques",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Interview: Chicago's Most Influential Stepping Instructors",
      excerpt: "We sit down with the city's top stepping instructors to discuss their journey, teaching philosophy, and the future of stepping.",
      author: "James Mitchell",
      date: "December 5, 2024",
      readTime: "12 min read",
      category: "interviews",
      image: "/placeholder.svg"
    },
    {
      id: 4,
      title: "Stepping Fashion: Dressing for the Dance Floor",
      excerpt: "From the perfect stepping shoes to stylish outfits that move with you - your complete guide to stepping fashion.",
      author: "Sarah Davis",
      date: "December 3, 2024",
      readTime: "5 min read",
      category: "fashion",
      image: "/placeholder.svg"
    },
    {
      id: 5,
      title: "Event Recap: Chicago Stepping Championship 2024",
      excerpt: "Highlights and memorable moments from this year's most prestigious stepping competition.",
      author: "Robert Brown",
      date: "November 28, 2024",
      readTime: "10 min read",
      category: "events",
      image: "/placeholder.svg"
    },
    {
      id: 6,
      title: "Building Confidence on the Dance Floor",
      excerpt: "Tips and techniques for overcoming dance anxiety and building the confidence to step with style.",
      author: "Lisa Thompson",
      date: "November 25, 2024",
      readTime: "7 min read",
      category: "techniques",
      image: "/placeholder.svg"
    }
  ];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticle = articles.find(article => article.featured);
  const otherArticles = filteredArticles.filter(article => !article.featured);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">SteppersLife Magazine</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your source for stepping culture, techniques, interviews, and community stories
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            {(categories ?? []).map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "bg-stepping-gradient" : ""}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Article */}
        {featuredArticle && selectedCategory === 'all' && (
          <div className="mb-12">
            <Card className="overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="aspect-video md:aspect-square bg-muted"></div>
                </div>
                <div className="md:w-1/2 p-6 md:p-8">
                  <Badge className="mb-4 bg-stepping-gradient">Featured</Badge>
                  <CardTitle className="text-2xl md:text-3xl mb-4">{featuredArticle.title}</CardTitle>
                  <CardDescription className="text-base mb-6">{featuredArticle.excerpt}</CardDescription>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {featuredArticle.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {featuredArticle.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {featuredArticle.readTime}
                    </div>
                  </div>
                  <Button size="lg" className="bg-stepping-gradient">Read Article</Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(otherArticles ?? []).map((article) => (
            <Card key={article.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="aspect-video bg-muted rounded-md mb-4"></div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {categories.find(cat => cat.id === article.category)?.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{article.readTime}</span>
                </div>
                <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                <CardDescription className="line-clamp-3">{article.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {article.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {article.date}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">Read Article</Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">Load More Articles</Button>
        </div>
      </div>
    </div>
  );
};

export default Magazine;
