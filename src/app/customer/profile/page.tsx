
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Star, MessageSquare, MoreVertical, User, Mail, Phone, MapPin } from "lucide-react";

export default function CustomerProfilePage() {
  const user = {
    name: "Alex Doe",
    email: "alex.doe@example.com",
    phone: "+1 234 567 890",
    address: "123 Main St, Anytown, USA",
    avatarUrl: "https://picsum.photos/seed/user/100/100",
    role: "Fashion Enthusiast",
  };

  const friends = [
    { name: "Jacob Lennon", time: "2 min ago", avatar: "https://picsum.photos/seed/friend1/40/40" },
    { name: "Didier Mailly", time: "5 min ago", avatar: "https://picsum.photos/seed/friend2/40/40" },
    { name: "Miguel Cunha Ferreira", time: "7 min ago", avatar: "https://picsum.photos/seed/friend3/40/40" },
    { name: "Eric Yuriev", time: "12 min ago", avatar: "https://picsum.photos/seed/friend4/40/40" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative h-48 md:h-56 bg-gradient-to-r from-red-500 to-purple-600 p-4 flex items-end rounded-b-2xl shadow-lg">
        <div className="flex items-center gap-4">
          <Avatar className="w-24 h-24 border-4 border-background">
            <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person" />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-sm text-white/80">{user.role}</p>
          </div>
        </div>
        <Button size="icon" className="absolute -bottom-6 right-6 rounded-full h-12 w-12 bg-red-500 hover:bg-red-600 shadow-md">
          <Plus className="h-6 w-6" />
          <span className="sr-only">Add</span>
        </Button>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        <Tabs defaultValue="friends" className="w-full mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="friends">Friend List</TabsTrigger>
            <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
          </TabsList>
          <TabsContent value="friends" className="mt-6">
            <Card>
              <CardContent className="p-0">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold p-4">Recently added friends</h3>
                  <ul className="divide-y divide-border">
                    {friends.map((friend, index) => (
                      <li key={index} className="flex items-center justify-between p-4 hover:bg-muted/50">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={friend.avatar} alt={friend.name} data-ai-hint="person portrait" />
                            <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{friend.name}</p>
                            <p className="text-xs text-muted-foreground">{friend.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Star className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="timeline">
             <Card>
                <CardContent className="p-6">
                    <p>Timeline content coming soon.</p>
                </CardContent>
             </Card>
          </TabsContent>
          <TabsContent value="top-rated">
             <Card>
                <CardContent className="p-6">
                    <p>Top Rated content coming soon.</p>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
