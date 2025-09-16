
import { Search, Package, Notebook, User, Ruler, Palette } from 'lucide-react';
import Link from 'next/link';

export default function DashboardCards() {
  return (
    <>
      <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground mb-8">Dashboard</h1>
      <section className="dashboard-grid">
        <div className="card green">
          
          <div className="card-body">
            <h3>Your Tailors</h3>
            <Search className="w-8 h-8 mx-auto my-2 text-black" />
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
            <Package className="w-8 h-8 mx-auto my-2 text-black" />
            <p>Active orders</p>
            <div className="progress">
            </div>
          </div>
          <div className="card-footer">
            <Link href="/customer/orders" className="btn-countdown">Track Orders</Link>
          </div>
        </div>

        <div className="card purple">
          <div className="card-body">
            <h3>Measurement</h3>
            <Ruler className="w-8 h-8 mx-auto my-2 text-black" />
            <p>Save your measurements</p>
            <div className="progress">
            </div>
          </div>
          <div className="card-footer">
            <Link href="/customer/measurement" className="btn-countdown">Manage</Link>
          </div>
        </div>

        <div className="card blue">
          
          <div className="card-body">
            <h3>Profile</h3>
            <User className="w-8 h-8 mx-auto my-2 text-black" />
            <p>Manage your account</p>
            <div className="progress">
            </div>
          </div>
          <div className="card-footer">
            <Link href="/customer/profile" className="btn-countdown">View Profile</Link>
          </div>
        </div>

        <div className="card red">
          
          <div className="card-body">
            <h3>Book Order</h3>
            <Notebook className="w-8 h-8 mx-auto my-2 text-black" />
            <p>Create a new order</p>
            <div className="progress">
            </div>
          </div>
          <div className="card-footer">
            <Link href="/customer/book-order" className="btn-countdown">Book Now</Link>
          </div>
        </div>

        <div className="card pink">
          <div className="card-body">
            <h3>Design Your Garment</h3>
            <Palette className="w-8 h-8 mx-auto my-2 text-black" />
            <p>Create a unique design</p>
            <div className="progress">
            </div>
          </div>
          <div className="card-footer">
            <Link href="/customer/design-garment" className="btn-countdown">Design Now</Link>
          </div>
        </div>
      </section>
    </>
  );
}
