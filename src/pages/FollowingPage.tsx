/**
 * FollowingPage Component - Epic G.005: Following Organizers, Instructors, Community Listings
 * 
 * Comprehensive following management interface with organized view of all follows,
 * filtering, search, bulk operations, and following analytics.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useFollowing } from '@/hooks/useFollowing';
import FollowButton from '@/components/following/FollowButton';
import FollowingFeed from '@/components/following/FollowingFeed';
import { 
  Users, 
  BookOpen, 
  Building, 
  Search, 
  Filter,
  Heart,
  TrendingUp,
  Calendar,
  MapPin,
  Star,
  Eye,
  UserPlus,
  Sparkles
} from 'lucide-react';
import { type FollowingRelationship } from '@/services/followingService';

const FollowingPage = () => {
  const {
    followingFeed,
    recommendations,
    trendingEntities,
    isLoading,
    refreshFeed,
    refreshRecommendations,
    refreshTrending,
    searchEntities
  } = useFollowing();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'organizer' | 'instructor' | 'business'>('all');
  const [activeTab, setActiveTab] = useState('feed');
  const [followingData, setFollowingData] = useState<FollowingRelationship[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Load user's following data
  useEffect(() => {
    const loadFollowingData = () => {
      try {
        const existingFollows = JSON.parse(localStorage.getItem('userFollowing') || '[]');
        setFollowingData(existingFollows);
      } catch (error) {
        console.error('Error loading following data:', error);
      }
    };

    loadFollowingData();
  }, []);

  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim()) {
        const results = await searchEntities(searchQuery, selectedType === 'all' ? undefined : selectedType);
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(performSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedType, searchEntities]);

  // Filter following data by type
  const filteredFollowing = followingData.filter(follow => 
    selectedType === 'all' || follow.entityType === selectedType
  );

  const getEntityTypeIcon = (type: string) => {
    switch (type) {
      case 'organizer': return <Users className="h-4 w-4" />;
      case 'instructor': return <BookOpen className="h-4 w-4" />;
      case 'business': return <Building className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getEntityTypeBadge = (type: string) => {
    const config = {
      organizer: { label: 'Organizer', color: 'bg-blue-100 text-blue-800' },
      instructor: { label: 'Instructor', color: 'bg-green-100 text-green-800' },
      business: { label: 'Business', color: 'bg-purple-100 text-purple-800' }
    };
    const { label, color } = config[type as keyof typeof config] || { label: 'Entity', color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge variant="secondary" className={color}>
        {getEntityTypeIcon(type)}
        <span className="ml-1">{label}</span>
      </Badge>
    );
  };

  const formatFollowDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFollowingStats = () => {
    const stats = {
      total: followingData.length,
      organizers: followingData.filter(f => f.entityType === 'organizer').length,
      instructors: followingData.filter(f => f.entityType === 'instructor').length,
      businesses: followingData.filter(f => f.entityType === 'business').length
    };
    return stats;
  };

  const stats = getFollowingStats();

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Following</h1>
          <p className="text-muted-foreground">
            Manage your follows and discover new organizers, instructors, and businesses
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Following</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Heart className="h-8 w-8 text-stepping-purple" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Organizers</p>
                <p className="text-2xl font-bold">{stats.organizers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Instructors</p>
                <p className="text-2xl font-bold">{stats.instructors}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">Businesses</p>
                <p className="text-2xl font-bold">{stats.businesses}</p>
              </div>
              <Building className="h-8 w-8 text-purple-500" />
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="feed">Following Feed</TabsTrigger>
            <TabsTrigger value="manage">Manage Following</TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>

          {/* Following Feed Tab */}
          <TabsContent value="feed" className="space-y-6">
            <FollowingFeed maxItems={15} showRefreshButton={true} />
          </TabsContent>

          {/* Manage Following Tab */}
          <TabsContent value="manage" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your follows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="organizer">Organizers</SelectItem>
                  <SelectItem value="instructor">Instructors</SelectItem>
                  <SelectItem value="business">Businesses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredFollowing.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Heart className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No follows yet</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Start following organizers, instructors, and businesses to see them here.
                  </p>
                  <Button asChild>
                    <Link to="/events">Discover Events</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFollowing.map((follow) => (
                  <Card key={follow.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        {getEntityTypeBadge(follow.entityType)}
                        <span className="text-xs text-muted-foreground">
                          {formatFollowDate(follow.followedAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {`${follow.entityType.charAt(0).toUpperCase()}${follow.entityType.slice(1)} ${follow.entityId.slice(-4)}`}
                        </CardTitle>
                        <FollowButton
                          entityId={follow.entityId}
                          entityType={follow.entityType}
                          variant="icon"
                          size="sm"
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Followed on {formatFollowDate(follow.followedAt)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Eye className="h-3 w-3" />
                          <span>
                            {follow.notificationPreferences.newEvents ? 'Getting notifications' : 'No notifications'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <Button size="sm" variant="outline" className="w-full">
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizers, instructors, businesses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedType} onValueChange={(value: any) => setSelectedType(value)}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="organizer">Organizers</SelectItem>
                  <SelectItem value="instructor">Instructors</SelectItem>
                  <SelectItem value="business">Businesses</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-stepping-purple" />
                  Recommended for You
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {recommendations.slice(0, 6).map((rec) => (
                    <Card key={rec.entity.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          {getEntityTypeBadge(rec.entity.type)}
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{rec.entity.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{rec.entity.name}</CardTitle>
                          <FollowButton
                            entityId={rec.entity.id}
                            entityType={rec.entity.type}
                            entityName={rec.entity.name}
                            variant="icon"
                            size="sm"
                          />
                        </div>
                        <CardDescription>{rec.entity.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                          {rec.entity.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              <span>{rec.entity.location}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            <span>{rec.entity.followerCount.toLocaleString()} followers</span>
                          </div>
                        </div>
                        
                        <div className="text-xs text-stepping-purple bg-stepping-purple/10 px-2 py-1 rounded">
                          {rec.reason}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchQuery && (
              <div>
                <h3 className="text-xl font-semibold mb-4">
                  Search Results ({searchResults.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map((entity) => (
                    <Card key={entity.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          {getEntityTypeBadge(entity.type)}
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{entity.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{entity.name}</CardTitle>
                          <FollowButton
                            entityId={entity.id}
                            entityType={entity.type}
                            entityName={entity.name}
                            variant="icon"
                            size="sm"
                          />
                        </div>
                        <CardDescription>{entity.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          {entity.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              <span>{entity.location}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3" />
                            <span>{entity.followerCount.toLocaleString()} followers</span>
                          </div>

                          {entity.specialties && entity.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {entity.specialties.slice(0, 2).map((specialty: string) => (
                                <Badge key={specialty} variant="outline" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-stepping-purple" />
                Trending Now
              </h3>
              <Button variant="outline" size="sm" onClick={refreshTrending}>
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingEntities.map((entity, index) => (
                  <Card key={entity.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getEntityTypeBadge(entity.type)}
                          {index < 3 && (
                            <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700">
                              #{index + 1}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{entity.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{entity.name}</CardTitle>
                        <FollowButton
                          entityId={entity.id}
                          entityType={entity.type}
                          entityName={entity.name}
                          variant="icon"
                          size="sm"
                        />
                      </div>
                      <CardDescription>{entity.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {entity.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>{entity.location}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3" />
                          <span>{entity.followerCount.toLocaleString()} followers</span>
                        </div>

                        {entity.specialties && entity.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {entity.specialties.slice(0, 2).map((specialty) => (
                              <Badge key={specialty} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FollowingPage;