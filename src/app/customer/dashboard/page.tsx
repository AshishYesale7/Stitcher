import { Search, Package, Notebook, User } from 'lucide-react';
import Link from 'next/link';

export default function CustomerDashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground mb-8">Dashboard</h1>
      <section className="dashboard-grid">
        <div className="card green">
          
          <div className="card-body">
            <h3>Your Tailors</h3>
            <Search className="w-12 h-12 mx-auto my-2 text-white" />
            <p>Find new tailors</p>
            <div className="progress">
              
              
            </div>
          </div>
          <div className="card-footer">
            <Link href="/customer/tailors" className="btn-countdown">Find Tailors</Link>
          </div>
        </div>

        <div className="card orange">
          
          <div className="card-body">
            <h3>Order Tracking</h3>
            <Package className="w-12 h-12 mx-auto my-2 text-white" />
            <p>Active orders</p>
            <div className="progress">
              
              
            </div>
          </div>
          <div className="card-footer">
            <Link href="/customer/orders" className="btn-countdown">Track Orders</Link>
          </div>
        </div>

        <div className="card red">
          
          <div className="card-body">
            <h3>Book Order</h3>
            <Notebook className="w-12 h-12 mx-auto my-2 text-white" />
            <p>Create a new order</p>
            <div className="progress">
              
              
            </div>
          </div>
          <div className="card-footer">
            <Link href="/customer/book-order" className="btn-countdown">Book Now</Link>
          </div>
        </div>

        <div className="card blue">
          
          <div className="card-body">
            <h3>Profile</h3>
            <User className="w-12 h-12 mx-auto my-2 text-white" />
            <p>Manage your account</p>
            <div className="progress">
              
              
            </div>
          </div>
          <div className="card-footer">
            <Link href="/customer/profile" className="btn-countdown">View Profile</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
