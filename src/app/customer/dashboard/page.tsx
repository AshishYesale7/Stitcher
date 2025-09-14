import { MoreVertical, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CustomerDashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground mb-8">Dashboard</h1>
      <section className="dashboard-grid">
        <div className="card green">
          <div className="card-header">
            <div className="date">Feb 2, 2024</div>
            <MoreVertical className="h-6 w-6 text-white cursor-pointer" />
          </div>
          <div className="card-body">
            <h3>Your Tailors</h3>
            <p>Find new tailors</p>
            <div className="progress">
              <span>Progress</span>
              <div className="progress-bar" style={{ '--progress-width': '90%' } as React.CSSProperties}></div>
              <span>90%</span>
            </div>
          </div>
          <div className="card-footer">
            <ul>
              <li><Image src="https://picsum.photos/seed/user1/40/40" alt="user" width={30} height={30} /></li>
              <li><Image src="https://picsum.photos/seed/user2/40/40" alt="user" width={30} height={30} /></li>
              <li>
                <Link href="#" className="btn-add">
                  <Plus className="h-4 w-4" />
                </Link>
              </li>
            </ul>
            <Link href="/customer/tailors" className="btn-countdown">Find Tailors</Link>
          </div>
        </div>

        <div className="card orange">
          <div className="card-header">
            <div className="date">Feb 5, 2024</div>
            <MoreVertical className="h-6 w-6 text-white cursor-pointer" />
          </div>
          <div className="card-body">
            <h3>Order Tracking</h3>
            <p>Active orders</p>
            <div className="progress">
              <span>Progress</span>
              <div className="progress-bar" style={{ '--progress-width': '30%' } as React.CSSProperties}></div>
              <span>30%</span>
            </div>
          </div>
          <div className="card-footer">
            <ul>
              <li><Image src="https://picsum.photos/seed/user3/40/40" alt="user" width={30} height={30} /></li>
              <li><Image src="https://picsum.photos/seed/user4/40/40" alt="user" width={30} height={30} /></li>
              <li>
                <Link href="#" className="btn-add">
                  <Plus className="h-4 w-4" />
                </Link>
              </li>
            </ul>
            <Link href="/customer/orders" className="btn-countdown">Track Orders</Link>
          </div>
        </div>

        <div className="card red">
          <div className="card-header">
            <div className="date">Mar 3, 2024</div>
            <MoreVertical className="h-6 w-6 text-white cursor-pointer" />
          </div>
          <div className="card-body">
            <h3>Book Order</h3>
            <p>Create a new order</p>
            <div className="progress">
              <span>Progress</span>
              <div className="progress-bar" style={{ '--progress-width': '50%' } as React.CSSProperties}></div>
              <span>50%</span>
            </div>
          </div>
          <div className="card-footer">
            <ul>
              <li><Image src="https://picsum.photos/seed/user5/40/40" alt="user" width={30} height={30} /></li>
              <li><Image src="https://picsum.photos/seed/user6/40/40" alt="user" width={30} height={30} /></li>
              <li>
                <Link href="#" className="btn-add">
                  <Plus className="h-4 w-4" />
                </Link>
              </li>
            </ul>
            <Link href="/customer/book-order" className="btn-countdown">Book Now</Link>
          </div>
        </div>

        <div className="card blue">
          <div className="card-header">
            <div className="date">Mar 8, 2024</div>
            <MoreVertical className="h-6 w-6 text-white cursor-pointer" />
          </div>
          <div className="card-body">
            <h3>Profile</h3>
            <p>Manage your account</p>
            <div className="progress">
              <span>Progress</span>
              <div className="progress-bar" style={{ '--progress-width': '20%' } as React.CSSProperties}></div>
              <span>20%</span>
            </div>
          </div>
          <div className="card-footer">
            <ul>
              <li><Image src="https://picsum.photos/seed/user7/40/40" alt="user" width={30} height={30} /></li>
              <li><Image src="https://picsum.photos/seed/user8/40/40" alt="user" width={30} height={30} /></li>
               <li>
                <Link href="#" className="btn-add">
                  <Plus className="h-4 w-4" />
                </Link>
              </li>
            </ul>
            <Link href="/customer/profile" className="btn-countdown">View Profile</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
