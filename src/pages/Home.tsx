
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Service Pro Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Work Orders</CardTitle>
            <CardDescription>Manage your service work orders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Create and manage work orders for your service business.</p>
            <Button asChild>
              <Link to="/admin/work-orders">View Work Orders</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Manage your invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Create and manage invoices for completed services.</p>
            <Button asChild>
              <Link to="/admin/invoices">View Invoices</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Estimates</CardTitle>
            <CardDescription>Manage your estimates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Create and manage estimates for potential customers.</p>
            <Button asChild>
              <Link to="/admin/estimates">View Estimates</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
