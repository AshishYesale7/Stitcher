import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { MoreVertical, User, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export default function CustomerDashboardPage() {
  return (
    <div className="bg-[#1C1C1E] min-h-screen p-4 sm:p-6 lg:p-8 text-white">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Your Tailors Card */}
          <Link href="/customer/tailors">
            <Card className="dashboard-card your-tailors-card bg-[#2C2C2E] border-none rounded-2xl p-6 flex flex-col justify-between aspect-square">
              <div className="flex justify-between items-center">
                <span className="text-sm"></span>
                <MoreVertical className="text-gray-400" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold">Your Tailors</h2>
                <div className="w-full bg-gray-700 rounded-full h-1.5 my-4">
                    <div className="bg-[#00FAD9] h-1.5 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 border-2 border-[#2C2C2E]">
                    <AvatarImage src="https://picsum.photos/seed/user1/40/40" />
                    <AvatarFallback>U1</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-8 w-8 border-2 border-[#2C2C2E] -ml-3">
                    <AvatarImage src="https://picsum.photos/seed/user2/40/40" />
                    <AvatarFallback>U2</AvatarFallback>
                  </Avatar>
                   <Avatar className="h-8 w-8 border-2 border-background bg-green-500 text-white -ml-3">
                    <AvatarFallback><Plus className="w-4 h-4"/></AvatarFallback>
                  </Avatar>
                </div>
                <div className="bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold">
                  2
                </div>
              </div>
            </Card>
          </Link>

          {/* Order Tracking Card */}
          <Link href="/customer/orders">
            <Card className="dashboard-card order-tracking-card bg-[#2C2C2E] border-none rounded-2xl p-6 flex flex-col justify-between aspect-square">
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-400">Order : Feb 05, 2021</p>
                        <MoreVertical className="text-gray-400" />
                    </div>
                    <div className='text-center space-y-2'>
                        <h2 className="text-2xl font-bold">Order Tracking</h2>
                        <p className="text-gray-400">Shopping</p>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-center text-sm mb-1">
                        <span>Progress</span>
                        <span>30%</span>
                    </div>
                    <Progress value={30} className="h-1.5 bg-gray-700" indicatorClassName="bg-[#FFB800]" />
                </div>
                 <Button variant="secondary" className="w-full bg-gray-700/80 hover:bg-gray-600 rounded-lg">Deliver in 3 Days</Button>
            </Card>
          </Link>

          {/* Book Order Card */}
          <Link href="/customer/book-order">
            <Card className="dashboard-card book-order-card bg-[#2C2C2E] border-none rounded-2xl p-6 flex items-center justify-center aspect-square">
              <h2 className="text-2xl font-bold">Book Order</h2>
            </Card>
          </Link>

          {/* Profile Card */}
          <Link href="/customer/profile">
            <Card className="dashboard-card profile-card bg-[#2C2C2E] border-none rounded-2xl p-6 flex items-center justify-center aspect-square">
              <h2 className="text-2xl font-bold">Profile</h2>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
