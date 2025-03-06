
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useGenerateDummyInvoices() {
  const generateDummyInvoices = async (count = 10) => {
    try {
      // First, check if we already have invoices
      const { count: existingCount, error: countError } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      if (existingCount && existingCount > 5) {
        toast.info(`${existingCount} invoices already exist. No need to generate more.`);
        return { success: true, count: existingCount };
      }
      
      // Get some customers to associate with invoices
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, customer_first_name, customer_last_name, customer_email, phone_number')
        .limit(5);
      
      if (customersError) throw customersError;
      
      if (!customers || customers.length === 0) {
        toast.error('No customers found. Please create customers first.');
        return { success: false };
      }
      
      // Get some service types for invoice items
      const { data: services, error: servicesError } = await supabase
        .from('service_types')
        .select('id, name, description, base_price')
        .limit(10);
      
      if (servicesError) throw servicesError;
      
      if (!services || services.length === 0) {
        toast.error('No services found. Please create services first.');
        return { success: false };
      }
      
      // Get business profile for company info
      const { data: business, error: businessError } = await supabase
        .from('business_profile')
        .select('*')
        .limit(1)
        .single();
      
      if (businessError && businessError.code !== 'PGRST116') throw businessError;
      
      // Get tax rates
      const { data: taxRates, error: taxError } = await supabase
        .from('business_taxes')
        .select('tax_type, tax_rate, tax_number');
      
      if (taxError) throw taxError;
      
      const gstRate = taxRates?.find(tax => tax.tax_type === 'GST')?.tax_rate || 5;
      const qstRate = taxRates?.find(tax => tax.tax_type === 'QST')?.tax_rate || 9.975;
      const gstNumber = taxRates?.find(tax => tax.tax_type === 'GST')?.tax_number || 'GST123456789';
      const qstNumber = taxRates?.find(tax => tax.tax_type === 'QST')?.tax_number || 'QST987654321';
      
      // Vehicle data
      const vehicleMakes = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Tesla', 'Chevrolet'];
      const vehicleModels = {
        Toyota: ['Corolla', 'Camry', 'RAV4', 'Highlander'],
        Honda: ['Civic', 'Accord', 'CR-V', 'Pilot'],
        Ford: ['F-150', 'Escape', 'Explorer', 'Mustang'],
        BMW: ['3 Series', '5 Series', 'X3', 'X5'],
        Mercedes: ['C-Class', 'E-Class', 'GLC', 'GLE'],
        Audi: ['A3', 'A4', 'Q5', 'Q7'],
        Tesla: ['Model 3', 'Model S', 'Model X', 'Model Y'],
        Chevrolet: ['Silverado', 'Equinox', 'Tahoe', 'Suburban'],
      };
      
      // Invoice statuses
      const statuses = ['draft', 'pending', 'paid', 'overdue', 'cancelled'];
      
      // Create invoices
      const invoices = [];
      
      for (let i = 0; i < count; i++) {
        const customerIndex = Math.floor(Math.random() * customers.length);
        const customer = customers[customerIndex];
        
        const make = vehicleMakes[Math.floor(Math.random() * vehicleMakes.length)];
        const model = vehicleModels[make][Math.floor(Math.random() * vehicleModels[make].length)];
        const year = 2010 + Math.floor(Math.random() * 13); // 2010-2023
        
        // Create random invoice items (1-5 items)
        const itemCount = 1 + Math.floor(Math.random() * 5);
        const invoiceItems = [];
        let subtotal = 0;
        
        for (let j = 0; j < itemCount; j++) {
          const serviceIndex = Math.floor(Math.random() * services.length);
          const service = services[serviceIndex];
          const quantity = 1 + Math.floor(Math.random() * 3);
          const unitPrice = service.base_price || (50 + Math.floor(Math.random() * 200));
          
          invoiceItems.push({
            service_id: service.id,
            service_name: service.name,
            description: service.description,
            quantity,
            unit_price: unitPrice
          });
          
          subtotal += quantity * unitPrice;
        }
        
        // Calculate taxes
        const gstAmount = subtotal * (gstRate / 100);
        const qstAmount = subtotal * (qstRate / 100);
        const total = subtotal + gstAmount + qstAmount;
        
        // Create date (between 1 and 365 days ago)
        const daysAgo = Math.floor(Math.random() * 365) + 1;
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - daysAgo);
        
        // Due date (created + 30 days)
        const dueDate = new Date(createdAt);
        dueDate.setDate(dueDate.getDate() + 30);
        
        // Status based on dates
        let status;
        if (daysAgo < 5) {
          status = 'draft';
        } else if (daysAgo < 30) {
          status = 'pending';
        } else {
          // Random status for older invoices
          status = statuses[Math.floor(Math.random() * statuses.length)];
        }
        
        // Generate a VIN-like number
        const generateVin = () => {
          const chars = '0123456789ABCDEFGHJKLMNPRSTUVWXYZ';
          let vin = '';
          for (let i = 0; i < 17; i++) {
            vin += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return vin;
        };
        
        const invoice = {
          customer_id: customer.id,
          customer_first_name: customer.customer_first_name,
          customer_last_name: customer.customer_last_name,
          customer_email: customer.customer_email,
          customer_phone: customer.phone_number,
          customer_address: '123 Main St, Anytown, CA 90210',
          customer_vehicle_make: make,
          customer_vehicle_model: model,
          customer_vehicle_year: year,
          customer_vehicle_vin: generateVin(),
          subtotal,
          gst_amount: gstAmount,
          qst_amount: qstAmount,
          total,
          status,
          created_at: createdAt.toISOString(),
          due_date: dueDate.toISOString(),
          notes: 'This is a test invoice generated for demonstration purposes.',
          company_name: business?.company_name || 'Auto Detailing Company',
          company_email: business?.email || 'contact@autodetailing.com',
          company_phone: business?.phone_number || '555-123-4567',
          company_address: business?.address || '456 Business Ave, Business City, BC 90210',
          gst_number: gstNumber,
          qst_number: qstNumber,
          is_finalized: Math.random() > 0.3 // 70% chance of being finalized
        };
        
        invoices.push(invoice);
      }
      
      // Insert invoices
      const { data: insertedInvoices, error: insertError } = await supabase
        .from('invoices')
        .insert(invoices)
        .select('id');
      
      if (insertError) throw insertError;
      
      // Insert invoice items
      const allInvoiceItems = [];
      
      for (let i = 0; i < insertedInvoices.length; i++) {
        const invoiceId = insertedInvoices[i].id;
        const items = invoices[i].invoiceItems || [];
        
        for (const item of items) {
          allInvoiceItems.push({
            ...item,
            invoice_id: invoiceId
          });
        }
      }
      
      if (allInvoiceItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(allInvoiceItems);
        
        if (itemsError) throw itemsError;
      }
      
      toast.success(`Successfully generated ${insertedInvoices.length} test invoices`);
      return { success: true, count: insertedInvoices.length };
    } catch (error) {
      console.error('Error generating test invoices:', error);
      toast.error('Failed to generate test invoices');
      return { success: false, error };
    }
  };
  
  return { generateDummyInvoices };
}
